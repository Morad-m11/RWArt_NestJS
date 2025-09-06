import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger('DB');

    async onModuleInit() {
        await this.$connect().catch((error) => {
            this.logger.fatal(`Failed establishing database connection. Error: ${error}`);
        });

        this.logger.log(`Established database connection`);
    }

    async onModuleDestroy() {
        await this.$disconnect().catch((error) => {
            this.logger.fatal(
                `Failed disconnecting the database connection. Error: ${error}`
            );
        });

        this.logger.log(`Disconnected database connection`);
    }
}
