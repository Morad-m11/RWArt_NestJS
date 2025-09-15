import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { minutes, Throttle } from '@nestjs/throttler';
import { User } from 'src/common/decorators/user.decorator';
import { OptionalJwtAuthGuard } from 'src/core/auth/anonymous/anonymous.guard';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @Throttle({ long: { ttl: minutes(1), limit: 1 } })
    @UseGuards(OptionalJwtAuthGuard)
    @Post()
    async create(@Body() body: CreateFeedbackDto, @User('id') userId?: number) {
        await this.feedbackService.create({ ...body, userId });
    }
}
