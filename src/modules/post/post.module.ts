import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AnonymousStrategy } from 'src/core/auth/anonymous/anonymous.strategy';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { ImageService } from './image-upload/image.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
    imports: [CloudinaryModule, PrismaModule],
    controllers: [PostController],
    providers: [PostService, ImageService, AnonymousStrategy]
})
export class PostModule {}
