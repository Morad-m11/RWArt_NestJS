import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MailService } from 'src/common/mail/mail.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { GoogleCustomStrategy } from 'src/core/auth/google/google.strategy';
import { ConfiguredJwtModule } from 'src/core/auth/jwt/jwt.module';
import { LocalStrategy } from 'src/core/auth/local/local.strategy';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';

@Module({
    imports: [ConfiguredJwtModule, PassportModule, PrismaModule],
    controllers: [AuthController],
    providers: [
        LocalStrategy,
        GoogleCustomStrategy,
        AuthService,
        UserService,
        MailService,
        TokenService
    ]
})
export class AuthModule {}
