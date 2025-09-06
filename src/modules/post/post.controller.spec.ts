import { Test, TestingModule } from '@nestjs/testing';
import { provideValue } from 'src/core/utils/provide';
import { ImageUploadService } from './image-upload/image-upload.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';

describe('PostController', () => {
    let controller: PostController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostController],
            providers: [provideValue(PostService), provideValue(ImageUploadService)]
        }).compile();

        controller = module.get<PostController>(PostController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
