import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AnonymousStrategy } from 'src/core/auth/anonymous/anonymous.strategy';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
    imports: [PrismaModule],
    controllers: [FeedbackController],
    providers: [FeedbackService, AnonymousStrategy]
})
export class FeedbackModule {}
