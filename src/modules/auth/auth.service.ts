import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { JWTDecodedThirdParty } from 'src/core/auth/google/google.strategy';
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

    async validateLocalUser(name: string, pass: string): Promise<User> {
        const user = await this.userService.findByName(name);

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException();
        }

        const isCorrectPassword = await this.comparePassword(pass, user.passwordHash);
        if (!isCorrectPassword) {
            throw new UnauthorizedException();
        }

        if (!user.email_verified) {
            throw new ForbiddenException('Email not verified');
        }

        return user;
    }

    async signIn(userId: number, username: string, userIP: string): Promise<JWTTokens> {
        return await this.issueAuthTokens(userId, username, userIP);
    }

    async signInThirdParty(
        user: JWTDecodedThirdParty,
        userIP: string
    ): Promise<JWTTokens> {
        const dbUser = await this.findOrCreateThirdPartyUser(user);
        return await this.issueAuthTokens(dbUser.id, dbUser.username, userIP);
    }

    async signUp(user: SignupRequest): Promise<void> {
        const dbUser = await this.findOrCreateUser(user);
        const token = await this.tokenService.createVerificationToken(dbUser.id);
        await this.mailService.sendVerificationPrompt(dbUser.email, token);
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

        await this.userService.update(userId, { email_verified: true });
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

    private async issueAuthTokens(
        id: number,
        username: string,
        userIP: string
    ): Promise<JWTTokens> {
        return {
            accessToken: await this.tokenService.createAccessToken(id, username),
            refreshToken: await this.tokenService.createRefreshToken(id, userIP)
        };
    }

    private async findOrCreateUser(user: SignupRequest) {
        const existingUser = await this.userService.findByEmail(user.email);

        if (!existingUser) {
            return await this.userService.create({
                email: user.email,
                username: user.username,
                passwordHash: await this.hashPassword(user.password)
            });
        }

        return existingUser;
    }

    private async findOrCreateThirdPartyUser(user: JWTDecodedThirdParty): Promise<User> {
        const dbUser = await this.userService.findByEmail(user.email);

        if (dbUser) {
            return dbUser;
        }

        if (!user.username) {
            throw new ConflictException('Username required for new user');
        }

        return await this.userService.createThirdParty(user);
    }
}
