import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const logger = new Logger('Database');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect().catch((error) => {
            logger.fatal(`Failed establishing database connection. Error: ${error}`);
        });

        logger.log(`Established database connection`);
    }
}
