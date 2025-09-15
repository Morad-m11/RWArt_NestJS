import { ForbiddenException, Injectable } from '@nestjs/common';
import { Post as PostEntity } from '@prisma/client';
import { omit } from 'src/common/omit';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

export type CreatePost = Pick<
    PostEntity,
    'authorId' | 'title' | 'description' | 'imageId'
>;

export type Post = Omit<PostEntity, 'authorId'> & {
    author: { username: string };
    upvoteCount: number;
    isOwner: boolean;
    isUpvoted: boolean;
};

export interface PostFilters {
    author?: string;
    limit?: number;
    offset?: number;
    sort?: 'asc' | 'desc';
    from?: Date;
    exclude?: number[];
}

@Injectable()
export class PostService {
    constructor(private prisma: PrismaService) {}

    async create(post: CreatePost): Promise<void> {
        await this.prisma.post.create({ data: post });
    }

    /** Returns a random selection of posts */
    async getFeatured(limit = 2, userId?: number): Promise<Post[]> {
        const now = new Date();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const lastWeek = new Date(now.getTime() - sevenDays);

        const lastWeekPosts = await this.findAll({ from: lastWeek }, userId);

        if (lastWeekPosts.length < limit) {
            const additionalPosts = await this.findAll(
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
        { author, limit, offset, sort, from, exclude }: PostFilters,
        userId?: number
    ): Promise<Post[]> {
        const posts = await this.prisma.post.findMany({
            orderBy: { createdAt: sort ?? 'desc' },
            take: limit ?? 10,
            skip: offset,
            where: {
                ...(author ? { author: { username: author } } : {}),
                ...(exclude ? { id: { notIn: exclude } } : {}),
                ...(from ? { createdAt: { gt: from } } : {})
            },
            include: {
                author: { select: { username: true } },
                _count: { select: { upvotes: true } },
                ...(userId ? { upvotes: { where: { userId } } } : {})
            }
        });

        return posts.map(({ _count, upvotes, ...post }) => ({
            ...omit(post, 'authorId'),
            upvoteCount: _count.upvotes,
            isUpvoted: upvotes?.length > 0,
            isOwner: userId === post.authorId
        }));
    }

    findOne(id: number) {
        return this.prisma.post.findFirst({ where: { id } });
    }

    update(id: number, _updatePostDto: UpdatePostDto) {
        return `This action updates a #${id} post`;
    }

    async remove(postId: number, userId: number) {
        if (!(await this.isOwner(postId, userId))) {
            throw new ForbiddenException('Insufficient permissions to modify post');
        }

        return await this.prisma.post.delete({ where: { id: postId } });
    }

    async toggleVote(postId: number, userId: number) {
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
}
