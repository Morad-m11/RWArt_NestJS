import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { ImageService } from './image-upload/image.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
    controllers: [PostController],
    providers: [PostService, PrismaService, ImageService],
    imports: [CloudinaryModule]
})
export class PostModule {}
