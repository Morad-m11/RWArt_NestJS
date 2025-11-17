import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import {
    Post as PostEntity,
    Prisma,
    Tag as TagEntity,
    Upvote,
    User
} from '@prisma/client';
import dayjs from 'dayjs';
import { omit, optional } from 'src/common/omit';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

type PostCreateBody = Prisma.PostGetPayload<{
    select: {
        title: true;
        description: true;
        authorId: true;
        imageId: true;
        tags: {
            select: { name: true };
        };
    };
}>;

export type Post = Omit<PostEntity, 'authorId' | 'tags'> & {
    author: { username: string };
    tags: string[];
    upvoteCount: number;
    isOwner: boolean;
    isUpvoted: boolean;
};

type PostFilters = GetPostsDto & {
    id?: number;
    excludeIds?: number[];
};

type PostWithInteractions = PostEntity & {
    author: Pick<User, 'username'>;
    upvotes?: Upvote[];
    tags: TagEntity[];
    _count: {
        upvotes: number;
    };
};

const FEATURED_LIMIT = 5;
const FEATURED_BLOCKED_DAYS = 3;

@Injectable()
export class PostService {
    constructor(private prisma: PrismaService) {}

    async create(post: PostCreateBody): Promise<void> {
        await this.prisma.post.create({
            data: {
                ...post,
                upvotes: {
                    create: { userId: post.authorId }
                },
                tags: {
                    connectOrCreate: post.tags.map((x) => ({
                        create: x,
                        where: { name: x.name }
                    }))
                }
            }
        });
    }

    async getFeatured(userId?: number): Promise<Post[]> {
        const startOfDay = dayjs().startOf('day').toDate();

        const featuredToday = await this.prisma.featuredPost.findMany({
            take: FEATURED_LIMIT,
            where: { featuredAt: { gte: startOfDay } },
            orderBy: { featuredAt: 'desc' },
            select: { post: { include: this.buildPostInclude(userId) } }
        });

        if (featuredToday.length) {
            return this.transformPosts(
                featuredToday.map((x) => x.post),
                userId
            );
        }

        return await this.createNotRecentlyFeaturedPosts(userId);
    }

    async findMany(
        filters: PostFilters,
        userId?: number
    ): Promise<{ posts: Post[]; totalCount: number }> {
        const { sort, limit, offset } = filters;
        const orderBy = { createdAt: sort ?? 'desc' };
        const where = this.buildPostWhere(filters);
        const include = this.buildPostInclude(userId);

        const [posts, totalCount] = await this.prisma.$transaction([
            this.prisma.post.findMany({
                orderBy,
                take: limit ?? 10,
                skip: offset,
                where,
                include
            }),
            this.prisma.post.count({ where })
        ]);

        return {
            posts: this.transformPosts(posts, userId),
            totalCount
        };
    }

    async findOne(postId: number, userId?: number): Promise<Post> {
        const post = await this.prisma.post.findFirst({
            where: this.buildPostWhere({ id: postId }),
            include: this.buildPostInclude(userId)
        });

        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        return this.transformPosts([post], userId)[0];
    }

    async update(_id: number, _updatePostDto: UpdatePostDto) {
        throw new InternalServerErrorException('Method not implemented');
    }

    async remove(postId: number, userId: number): Promise<PostEntity> {
        if (!(await this.isOwner(postId, userId))) {
            throw new ForbiddenException('Insufficient permissions to modify post');
        }

        return await this.prisma.post.delete({ where: { id: postId } });
    }

    async toggleUpvote(postId: number, userId: number) {
        const isUpvoted = await this.isUpvoted(postId, userId);

        if (isUpvoted) {
            await this.prisma.upvote.delete({
                where: { userId_postId: { userId, postId } }
            });
        } else {
            await this.prisma.upvote.create({
                data: { postId, userId }
            });
        }
    }

    async isOwner(id: number, authorId: number): Promise<boolean> {
        const count = await this.prisma.post.count({ where: { id, authorId } });
        return count > 0;
    }

    private async createNotRecentlyFeaturedPosts(userId?: number) {
        const xDaysAgo = dayjs()
            .subtract(FEATURED_BLOCKED_DAYS, 'days')
            .startOf('day')
            .toDate();

        const posts = await this.prisma.post.findMany({
            where: {
                featured: {
                    none: {
                        featuredAt: { gte: xDaysAgo }
                    }
                }
            },
            take: FEATURED_LIMIT,
            orderBy: { createdAt: 'desc' },
            include: this.buildPostInclude(userId)
        });

        await this.prisma.featuredPost.createMany({
            data: posts.map((post) => ({ postId: post.id })),
            skipDuplicates: true
        });

        return this.transformPosts(posts, userId);
    }

    private async isUpvoted(postId: number, userId: number): Promise<boolean> {
        const count = await this.prisma.upvote.count({
            where: { postId, userId }
        });

        return count > 0;
    }

    private buildPostInclude(userId: number | undefined): Prisma.PostInclude {
        return {
            author: { select: { username: true, picture: true } },
            _count: { select: { upvotes: true } },
            tags: { select: { name: true } },
            ...optional(userId, { upvotes: { where: { userId } } })
        };
    }

    private buildPostWhere(filters: PostFilters): Prisma.PostWhereInput {
        const { id, author, excludeIds, from, search, tags } = filters;

        console.warn(tags);

        return {
            ...optional(id, { id }),
            ...optional(author, {
                author: { username: { equals: author, mode: 'insensitive' } }
            }),
            ...optional(excludeIds, { id: { notIn: excludeIds } }),
            ...optional(from, { createdAt: { gte: from } }),
            ...optional(search, {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...optional(tags?.length, {
                AND: tags?.map((tag) => ({
                    tags: {
                        some: {
                            name: { equals: tag, mode: 'insensitive' }
                        }
                    }
                }))
            })
        };
    }

    private transformPosts(posts: PostWithInteractions[], userId?: number): Post[] {
        return posts.map((post) => ({
            ...omit(post, 'authorId', '_count', 'upvotes', 'tags'),
            tags: post.tags.map((x) => x.name),
            upvoteCount: post._count.upvotes,
            isUpvoted: !!post.upvotes?.length,
            isOwner: post.authorId === userId
        }));
    }
}
