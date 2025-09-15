import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { provideValue } from 'src/common/test-provide';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
    let service: FeedbackService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FeedbackService, provideValue(PrismaService)]
        }).compile();

        service = module.get<FeedbackService>(FeedbackService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
