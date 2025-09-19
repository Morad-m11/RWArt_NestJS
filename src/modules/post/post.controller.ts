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
import { JwtUserClaims, User } from 'src/common/decorators/user.decorator';
import { OptionalJwtAuthGuard } from 'src/core/auth/anonymous/anonymous.guard';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ImageService } from './image-upload/image.service';
import { Post as PostResponse, PostService } from './post.service';

const MAX_FILE_SIZE_BYTES = 10 * 1e6;
const SUPPORTED_FILE_TYPES = /jpeg|png|webp|gif/;

@UseGuards(OptionalJwtAuthGuard)
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
        @User() user: JwtUserClaims,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({ fileType: SUPPORTED_FILE_TYPES })
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

    @Get('featured')
    async getFeatured(
        @Query('limit') limit?: number,
        @User('id') userId?: number
    ): Promise<PostResponse[]> {
        return await this.postService.getFeatured(limit, userId);
    }

    @Get()
    async findAll(@Query() filters: GetPostsDto, @User('id') userId?: number) {
        return await this.postService.findAll(filters, userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @User('id') userId: number) {
        return this.postService.findOne(+id, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        return this.postService.update(+id, updatePostDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(
        @Param('id', new ParseIntPipe()) id: number,
        @User('id') userId: number
    ) {
        const post = await this.postService.remove(id, userId);
        await this.imageService.delete(post.imageId).catch(() => {});
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':id/upvote')
    async vote(
        @Param('id', new ParseIntPipe()) postId: number,
        @User('id') userId: number
    ) {
        return await this.postService.toggleUpvote(postId, userId);
    }
}
