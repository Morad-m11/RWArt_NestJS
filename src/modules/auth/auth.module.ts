import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfiguredJwtModule } from 'src/core/auth/jwt/jwt.module';
import { LocalStrategy } from 'src/core/auth/local/local.strategy';
import { MailService } from 'src/core/services/mail/mail.service';
import { PrismaModule } from 'src/core/services/prisma/prisma.module';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';

@Module({
    imports: [PassportModule, ConfiguredJwtModule, PrismaModule],
    controllers: [AuthController],
    providers: [LocalStrategy, AuthService, UserService, MailService, TokenService]
})
export class AuthModule {}
