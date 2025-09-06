import { Module } from '@nestjs/common';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { ImageUploadService } from './image-upload/image-upload.service';

@Module({
    controllers: [PostController],
    providers: [PostService, PrismaService, ImageUploadService]
})
export class PostModule {}
