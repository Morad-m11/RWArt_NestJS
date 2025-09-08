import { Injectable } from '@nestjs/common';
import { Post as PostEntity } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

type CreatePost = Pick<PostEntity, 'authorId' | 'title' | 'description' | 'imageId'>;
type Post = PostEntity & { author: { username: string } } & { upvoted: boolean };

interface FindPostsArgs {
    limit?: number;
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
    async getFeatured(count = 2, userId?: number): Promise<Post[]> {
        const now = new Date();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const lastWeek = new Date(now.getTime() - sevenDays);

        const lastWeekPosts = await this.findAll({ from: lastWeek }, userId);

        if (lastWeekPosts.length < count) {
            const additionalPosts = await this.findAll(
                {
                    exclude: lastWeekPosts.map((x) => x.id),
                    limit: count - lastWeekPosts.length
                },
                userId
            );

            return [...lastWeekPosts, ...additionalPosts];
        }

        return lastWeekPosts.sort(() => Math.random() - 0.5).slice(0, count);
    }

    async findAll(
        { limit, sort, from, exclude }: FindPostsArgs,
        userId?: number
    ): Promise<Post[]> {
        const posts = await this.prisma.post.findMany({
            take: limit ?? 10,
            orderBy: { createdAt: sort ?? 'desc' },
            where: {
                ...(exclude ? { id: { notIn: exclude } } : {}),
                ...(from ? { createdAt: { gt: from } } : {})
            },
            include: {
                author: { select: { username: true } },
                ...(userId ? { upvotes: { where: { userId } } } : {})
            }
        });

        return posts.map(({ upvotes, ...post }) => ({
            ...post,
            upvoted: upvotes?.length > 0
        }));
    }

    findOne(id: number) {
        return `This action returns a #${id} post`;
    }

    update(id: number, _updatePostDto: UpdatePostDto) {
        return `This action updates a #${id} post`;
    }

    remove(id: number) {
        return `This action removes a #${id} post`;
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

    private async isUpvoted(postId: number, userId: number): Promise<boolean> {
        const count = await this.prisma.upvote.count({
            where: { postId, userId }
        });

        return count > 0;
    }
}
