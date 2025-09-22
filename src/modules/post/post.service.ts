import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
    Post as PostEntity,
    Prisma,
    Tag as TagEntity,
    Upvote,
    User
} from '@prisma/client';
import { omit } from 'src/common/omit';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

type PostCreateBody = Prisma.PostGetPayload<{
    omit: {
        id: true;
        createdAt: true;
    };
    include: {
        tags: { omit: { id: true } };
    };
}>;

export type Post = Omit<PostEntity, 'authorId'> & {
    author: { username: string };
    upvoteCount: number;
    isOwner: boolean;
    isUpvoted: boolean;
};

type PostFilters = GetPostsDto & {
    id?: number;
    exclude?: number[];
};

@Injectable()
export class PostService {
    constructor(private prisma: PrismaService) {}

    async create(post: PostCreateBody): Promise<void> {
        await this.prisma.post.create({
            data: {
                ...omit(post, 'tags'),
                tags: {
                    connectOrCreate: post.tags.map((x) => ({
                        create: x,
                        where: { name: x.name }
                    }))
                }
            }
        });
    }

    /** Returns a random selection of posts */
    async getFeatured(limit = 2, userId?: number): Promise<Post[]> {
        const now = new Date();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const lastWeek = new Date(now.getTime() - sevenDays);

        const { posts: lastWeekPosts } = await this.findAll({ from: lastWeek }, userId);

        if (lastWeekPosts.length < limit) {
            const { posts: additionalPosts } = await this.findAll(
                {
                    exclude: lastWeekPosts.map((x) => x.id),
                    limit: limit - lastWeekPosts.length
                },
                userId
            );

            return [...lastWeekPosts, ...additionalPosts].sort(() => Math.random() - 0.5);
        }

        return lastWeekPosts.sort(() => Math.random() - 0.5).slice(0, limit);
    }

    async findAll(
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
            posts: posts.map((post) => this.transformPost(post, userId)),
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

        return this.transformPost(post);
    }

    update(id: number, _updatePostDto: UpdatePostDto) {
        return `This action updates a #${id} post`;
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

    private async isUpvoted(postId: number, userId: number): Promise<boolean> {
        const count = await this.prisma.upvote.count({
            where: { postId, userId }
        });

        return count > 0;
    }

    private buildPostWhere(filters: PostFilters): Prisma.PostWhereInput {
        const { author, exclude, from, search, tags } = filters;

        return {
            ...(author ? { author: { username: author } } : {}),
            ...(exclude ? { id: { notIn: exclude } } : {}),
            ...(from ? { createdAt: { gte: from } } : {}),
            ...(search
                ? {
                      OR: [
                          { title: { contains: search, mode: 'insensitive' } },
                          { description: { contains: search, mode: 'insensitive' } }
                      ]
                  }
                : {}),
            ...(tags?.length
                ? {
                      AND: tags.map((tag) => ({
                          tags: {
                              some: {
                                  category: { equals: tag.category, mode: 'insensitive' },
                                  name: { equals: tag.name, mode: 'insensitive' }
                              }
                          }
                      }))
                  }
                : {})
        };
    }

    private buildPostInclude(userId?: number): Prisma.PostInclude {
        return {
            author: { select: { username: true } },
            _count: { select: { upvotes: true } },
            tags: true,
            ...(userId ? { upvotes: { where: { userId } } } : {})
        };
    }

    private transformPost(
        post: PostEntity & {
            author: Pick<User, 'username'>;
            upvotes?: Upvote[];
            tags: TagEntity[];
            _count: { upvotes: number };
        },
        userId?: number
    ): Post {
        return {
            ...omit(post, 'authorId', '_count', 'upvotes'),
            upvoteCount: post._count.upvotes,
            isUpvoted: !!post.upvotes?.length,
            isOwner: post.authorId === userId
        };
    }
}
