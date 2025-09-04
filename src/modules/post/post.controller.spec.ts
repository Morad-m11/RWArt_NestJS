import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { provideValue } from 'src/core/utils/provide';
import { PostController } from './post.controller';
import { PostService } from './post.service';

describe('PostController', () => {
    let controller: PostController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostController],
            providers: [provideValue(PostService, mock<PostService>())]
        }).compile();

        controller = module.get<PostController>(PostController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
