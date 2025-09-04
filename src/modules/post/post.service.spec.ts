import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { provideValue } from 'src/core/utils/provide';
import { PostService } from './post.service';

describe('PostService', () => {
    let service: PostService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PostService, provideValue(PrismaService, {})]
        }).compile();

        service = module.get<PostService>(PostService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
