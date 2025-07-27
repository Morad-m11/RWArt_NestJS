import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RegisteredJwtModule } from 'src/core/auth/jwt/jwt.module';
import { LocalStrategy } from 'src/core/auth/jwt/local.strategy';
import { PrismaService } from 'src/core/prisma.service';
import { UserModule } from 'src/modules/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [UserModule, PassportModule, RegisteredJwtModule],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, PrismaService],
})
export class AuthModule {}
