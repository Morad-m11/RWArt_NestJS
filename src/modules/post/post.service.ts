import { Injectable } from '@nestjs/common';
import { Post as PostEntity } from '@prisma/client';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

type CreatePost = Pick<PostEntity, 'authorId' | 'title' | 'description' | 'imageUrl'>;
type Post = PostEntity & { author: { username: string } };

@Injectable()
export class PostService {
    constructor(private prisma: PrismaService) {}

    async create(post: CreatePost): Promise<void> {
        await this.prisma.post.create({ data: post });
    }

    /** Returns a random selection of posts */
    async getFeatured(count: number): Promise<Post[]> {
        const now = new Date();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const lastWeek = new Date(now.getTime() - sevenDays);

        const lastWeekPosts = await this.prisma.post.findMany({
            where: { createdAt: { gte: lastWeek } },
            include: { author: { select: { username: true } } }
        });

        if (lastWeekPosts.length >= count) {
            return lastWeekPosts.sort(() => Math.random() - 0.5).slice(0, count);
        }

        const diff = count - lastWeekPosts.length;
        const additionalPosts = await this.prisma.post.findMany({
            where: { id: { notIn: lastWeekPosts.map((x) => x.id) } },
            include: { author: { select: { username: true } } },
            take: diff
        });

        return [...lastWeekPosts, ...additionalPosts];
    }

    findAll() {
        return `This action returns all post`;
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
}
