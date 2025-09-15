import { Test, TestingModule } from '@nestjs/testing';
import { provideValue } from 'src/common/test-provide';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

describe('FeedbackController', () => {
    let controller: FeedbackController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FeedbackController],
            providers: [provideValue(FeedbackService)]
        }).compile();

        controller = module.get<FeedbackController>(FeedbackController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
