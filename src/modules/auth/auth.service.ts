import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { MailService } from 'src/core/services/mail/mail.service';
import { UserService } from '../user/user.service';
import { SignupRequest } from './auth.controller';
import { TokenService } from './token/token.service';

interface JWTTokens {
    accessToken: string;
    refreshToken: string;
}

const HASH_SALT = 10;

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private mailService: MailService,
        private tokenService: TokenService
    ) {}

    async validateUser(name: string, pass: string): Promise<User> {
        const user = await this.userService.findByName(name);

        if (!user) {
            throw new UnauthorizedException();
        }

        const isCorrectPassword = await this.comparePassword(pass, user.passwordHash);
        if (!isCorrectPassword) {
            throw new UnauthorizedException();
        }

        if (!user.email_verified) {
            const token = await this.tokenService.createVerificationToken(user.id);
            await this.mailService.sendVerificationPrompt(user.email, token);
            throw new ForbiddenException('Email not verified');
        }

        return user;
    }

    async signIn(userId: number, username: string, userIP: string): Promise<JWTTokens> {
        const accessToken = await this.tokenService.createAccessToken(userId, username);
        const refreshToken = await this.tokenService.createRefreshToken(userId, userIP);
        return { accessToken, refreshToken };
    }

    async signUp(user: SignupRequest): Promise<void> {
        let existingUser = await this.userService.findByEmail(user.email);

        if (!existingUser) {
            existingUser = await this.userService.create({
                email: user.email,
                username: user.username,
                passwordHash: await this.hashPassword(user.password)
            });
        }

        const token = await this.tokenService.createVerificationToken(existingUser.id);
        await this.mailService.sendVerificationPrompt(existingUser.email, token);
    }

    async signOut(refreshToken: string): Promise<void> {
        await this.tokenService.revokeRefreshToken(refreshToken, 'Logged out');
    }

    async verifyAccount(verificationToken: string): Promise<void> {
        const { tokenId, userId } = await this.tokenService
            .findValidVerificationToken(verificationToken)
            .catch(() => {
                throw new BadRequestException('Invalid or expired verification token');
            });

        await this.userService.update(userId, {
            email_verified: true
        });

        await this.tokenService.deleteVerificationToken(tokenId);
    }

    async resendVerification(username: string) {
        const user = await this.userService.findByName(username);

        if (!user) {
            return;
        }

        const token = await this.tokenService.createVerificationToken(user.id);
        await this.mailService.sendVerificationPrompt(user.email, token);
    }

    async recoverAccount(email: string): Promise<void> {
        const user = await this.userService.findByEmail(email);

        if (!user) {
            return;
        }

        const token = await this.tokenService.createPasswordResetToken(user.id);
        await this.mailService.sendAccountRecoveryPrompt(email, user.username, token);
    }

    async resetPassword(resetToken: string, newPassword: string): Promise<void> {
        const { tokenId, userId } = await this.tokenService
            .findValidPasswordResetToken(resetToken)
            .catch(() => {
                throw new BadRequestException('Invalid or expired reset token');
            });

        await this.userService.update(userId, {
            passwordHash: await this.hashPassword(newPassword)
        });

        await this.tokenService.deletePasswordResetToken(tokenId);
    }

    async refreshAccessToken(refreshToken: string, userIP: string): Promise<JWTTokens> {
        return await this.tokenService.refreshAccessToken(refreshToken, userIP);
    }

    async hashPassword(rawValue: string): Promise<string> {
        return await bcrypt.hash(rawValue, HASH_SALT);
    }

    async comparePassword(pass: string, hashed: string): Promise<boolean> {
        return await bcrypt.compare(pass, hashed);
    }
}
