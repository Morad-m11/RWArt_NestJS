import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
    constructor(private prisma: PrismaService) {}

    create(_createPostDto: CreatePostDto) {
        return 'This action adds a new post';
    }

    /** Returns a random selection of posts */
    async getFeatured(count: number): Promise<Post[]> {
        return await this.prisma.$queryRaw`
            SELECT *
            FROM "Post"
            ORDER BY random()
            LIMIT ${count}
        `;
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
