import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { User } from '@prisma/client';
import { MailService } from 'src/common/mail/mail.service';
import { JWTDecodedThirdParty } from 'src/core/auth/google/google.strategy';
import { UserService } from '../user/user.service';
import { SignupRequest } from './auth.controller';
import { TokenService } from './token/token.service';

interface JWTTokens {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private mailService: MailService,
        private tokenService: TokenService
    ) {}

    async validateLocalUser(username: string, password: string): Promise<User> {
        const user = await this.userService.findOneLocal({ username });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException();
        }

        if (!(await this.userService.comparePassword(password, user.passwordHash))) {
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
        const dbUser = await this.userService.create(user);
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

        await this.userService.verifyUser(userId);
        await this.tokenService.deleteVerificationToken(tokenId);
    }

    async resendVerification(username: string) {
        const user = await this.userService.findOneLocal({ username });

        if (!user) {
            return;
        }

        const token = await this.tokenService.createVerificationToken(user.id);
        await this.mailService.sendVerificationPrompt(user.email, token);
    }

    async recoverAccount(email: string): Promise<void> {
        const user = await this.userService.findOneLocal({ email });

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

        await this.userService.updatePassword(userId, newPassword);
        await this.tokenService.deletePasswordResetToken(tokenId);
    }

    async refreshAccessToken(refreshToken: string, userIP: string): Promise<JWTTokens> {
        return await this.tokenService.refreshAccessToken(refreshToken, userIP);
    }

    private async findOrCreateThirdPartyUser(user: JWTDecodedThirdParty): Promise<User> {
        const dbUser = await this.userService.findOne({ email: user.email });

        if (dbUser) {
            return dbUser;
        }

        if (!user.username) {
            throw new ConflictException('Username required for new user');
        }

        return await this.userService.createThirdParty({
            email: user.email,
            username: user.username,
            picture: user.picture,
            provider: user.provider,
            providerUserId: user.providerUserId
        });
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
}
