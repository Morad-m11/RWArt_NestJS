import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { AnonymousStrategy } from 'src/core/auth/anonymous/anonymous.strategy';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
    controllers: [FeedbackController],
    providers: [FeedbackService, PrismaService, AnonymousStrategy]
})
export class FeedbackModule {}
