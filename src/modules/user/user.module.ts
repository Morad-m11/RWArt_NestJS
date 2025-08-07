import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/core/auth/jwt/jwt.strategy';
import { PrismaModule } from 'src/core/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [PrismaModule],
    controllers: [UserController],
    providers: [UserService, JwtStrategy],
    exports: [UserService]
})
export class UserModule {}
