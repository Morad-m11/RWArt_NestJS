import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/core/auth/jwt/jwt.strategy';
import { PrismaService } from 'src/core/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    controllers: [UserController],
    providers: [UserService, PrismaService, JwtStrategy],
    exports: [UserService],
})
export class UserModule {}
