import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { AnonymousStrategy } from 'src/core/auth/anonymous/anonymous.strategy';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { ImageService } from './image-upload/image.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
    imports: [CloudinaryModule],
    controllers: [PostController],
    providers: [PostService, PrismaService, ImageService, AnonymousStrategy]
})
export class PostModule {}
