import { Module } from '@nestjs/common';
import { MailService } from 'src/common/mail/mail.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CustomGoogleStrategy } from 'src/core/auth/google/google.strategy';
import { ConfiguredJwtModule } from 'src/core/auth/jwt/jwt.module';
import { JwtStrategy } from 'src/core/auth/jwt/jwt.strategy';
import { LocalStrategy } from 'src/core/auth/local/local.strategy';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';

@Module({
    imports: [ConfiguredJwtModule, PrismaModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        UserService,
        MailService,
        TokenService,
        JwtStrategy,
        CustomGoogleStrategy,
        LocalStrategy
    ]
})
export class AuthModule {}
