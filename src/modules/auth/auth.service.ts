import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { User as UserEntity } from '@prisma/client';
import { JwtUserClaims } from 'src/common/decorators/user.decorator';
import { MailService } from 'src/common/mail/mail.service';
import { extract } from 'src/common/omit';
import { JWTDecodedThirdParty } from 'src/core/auth/google/google.strategy';
import { UserService } from '../user/user.service';
import { SignupDto } from './dto/signup.dto';
import { TokenService } from './token/token.service';

interface JWTTokens {
    accessToken: string;
    refreshToken: string;
}

type AuthUser = {
    id: number;
    email: string;
    username: string;
    picture: string | null;
};

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private mailService: MailService,
        private tokenService: TokenService
    ) {}

    async getAuthUser(userId: number): Promise<AuthUser> {
        const user = await this.userService.findOne({ id: userId });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return extract(user, 'id', 'email', 'username', 'picture');
    }

    async validateLocalUser(username: string, password: string): Promise<JwtUserClaims> {
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

        return { id: user.id, username: user.username };
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

    async signUp(user: SignupDto): Promise<void> {
        if (await this.userService.exists({ email: user.email })) {
            return;
        }

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

    private async findOrCreateThirdPartyUser(
        user: JWTDecodedThirdParty
    ): Promise<UserEntity> {
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
