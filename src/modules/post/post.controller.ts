import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards
} from '@nestjs/common';
import { Post as PostEntity } from '@prisma/client';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { RequestWithJwt } from 'src/core/auth/jwt/jwt.module';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Req() req: RequestWithJwt, @Body() post: CreatePostDto) {
        return await this.postService.create(req.user.userId, post);
    }

    @Get('featured')
    async getFeatured(): Promise<PostEntity[]> {
        return await this.postService.getFeatured(2);
    }

    @Get()
    findAll() {
        return this.postService.findAll();
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
}
