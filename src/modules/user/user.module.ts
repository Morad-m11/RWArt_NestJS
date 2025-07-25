import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/core/prisma.service';

@Module({
    providers: [UserService, PrismaService],
    exports: [UserService],
    controllers: [UserController],
})
export class UserModule {}
