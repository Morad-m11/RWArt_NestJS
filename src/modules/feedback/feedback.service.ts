import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

type FeedbackCreateArgs = Prisma.FeedbackCreateInput & {
    userId?: number;
};

@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService) {}

    async create(feedback: FeedbackCreateArgs) {
        await this.prisma.feedback.create({
            data: {
                name: feedback.name,
                title: feedback.title,
                category: feedback.category,
                message: feedback.message,
                authorId: feedback.userId
            }
        });
    }
}
