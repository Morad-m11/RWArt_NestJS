import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RegisteredJwtModule } from 'src/core/auth/jwt/jwt.module';
import { LocalStrategy } from 'src/core/auth/local/local.strategy';
import { MailService } from 'src/core/mail/mail.service';
import { PrismaService } from 'src/core/prisma.service';
import { UserModule } from 'src/modules/user/user.module';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [UserModule, PassportModule, RegisteredJwtModule],
    controllers: [AuthController],
    providers: [LocalStrategy, AuthService, UserService, MailService, PrismaService]
})
export class AuthModule {}
