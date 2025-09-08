import {
    BadGatewayException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Post as PostEntity } from '@prisma/client';
import { User } from 'src/common/decorators/user.decorator';
import { OptionalJwtAuthGuard } from 'src/core/auth/anonymous/anonymous.guard';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { UserJWT } from 'src/core/auth/jwt/jwt.module';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ImageService } from './image-upload/image.service';
import { PostService } from './post.service';

const MAX_FILE_SIZE_BYTES = 10 * 1e6;

@Controller('post')
export class PostController {
    constructor(
        private readonly imageService: ImageService,
        private readonly postService: PostService
    ) {}

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('image', { limits: { files: 1, fileSize: MAX_FILE_SIZE_BYTES } })
    )
    @Post()
    async create(
        @User() user: UserJWT,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({ fileType: /jpeg|png|webp|gif/ })
                .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES })
                .build()
        )
        image: Express.Multer.File,
        @Body() post: CreatePostDto
    ) {
        const imageId = await this.imageService.upload(image).catch((error) => {
            throw new BadGatewayException('Image upload failed', { cause: error });
        });

        await this.postService.create({ ...post, authorId: user.id, imageId });
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get('featured')
    async getFeatured(
        @Query('count') count?: number,
        @User('id') userId?: number
    ): Promise<PostEntity[]> {
        return await this.postService.getFeatured(count, userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get()
    async findAll(@Query() query: GetPostsDto, @User('id') userId?: number) {
        return await this.postService.findAll(query, userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        return this.postService.update(+id, updatePostDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.postService.remove(+id);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':id/upvote')
    async vote(
        @Param('id', new ParseIntPipe()) postId: number,
        @User('id') userId: number
    ) {
        return await this.postService.toggleVote(postId, userId);
    }
}
