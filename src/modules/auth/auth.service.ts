import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Request } from 'express';
import { Config } from 'src/config/validation-schema';
import { JWTPayload } from 'src/core/auth/jwt/jwt.module';
import { HASH_SALT } from 'src/core/hash';
import { MailService } from 'src/core/mail/mail.service';
import { PrismaService } from 'src/core/prisma.service';
import { UserService } from '../user/user.service';
import { SignupRequest } from './auth.controller';

interface JWTConfig {
    refresh: {
        secret: string;
        expiry: string;
    };
    verify: {
        secret: string;
        expiry: string;
    };
}

interface JWTTokens {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    private readonly jwtConfig: JWTConfig;
    private readonly passwordExpiryDuration: number;

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private prisma: PrismaService,
        private mail: MailService,
        config: ConfigService
    ) {
        this.jwtConfig = {
            refresh: {
                secret: config.getOrThrow(Config.JWT_REFRESH_SECRET),
                expiry: config.getOrThrow(Config.JWT_REFRESH_EXP)
            },
            verify: {
                secret: config.getOrThrow(Config.JWT_VERIFY_SECRET),
                expiry: config.getOrThrow(Config.JWT_VERIFY_EXP)
            }
        };

        this.passwordExpiryDuration = config.getOrThrow(Config.PASSWORD_RESET_EXP);
    }

    async validateUser(name: string, pass: string): Promise<User> {
        const user = await this.userService.getByName(name).catch(() => {
            throw new UnauthorizedException();
        });

        const passwordMatches = await bcrypt.compare(pass, user.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedException();
        }

        if (!user.email_verified) {
            const verifyToken = await this.jwtService.signAsync(
                { sub: user.id, username: user.username },
                {
                    secret: this.jwtConfig.verify.secret,
                    expiresIn: this.jwtConfig.verify.expiry
                }
            );

            await this.mail.sendVerificationPrompt(
                user.email,
                user.username,
                verifyToken
            );
            throw new ForbiddenException('Email not verified');
        }

        return user;
    }

    async signIn(userId: number, username: string, userIP: string): Promise<JWTTokens> {
        return await this.generateAndStoreTokens(userId, username, userIP);
    }

    async signUp(user: SignupRequest): Promise<void> {
        const createdUser = await this.userService.create({
            email: user.email,
            username: user.username,
            passwordHash: await bcrypt.hash(user.password, HASH_SALT)
        });

        const verifyToken = await this.jwtService.signAsync(
            { sub: createdUser.id, username: createdUser.username },
            {
                secret: this.jwtConfig.verify.secret,
                expiresIn: this.jwtConfig.verify.expiry
            }
        );

        await this.mail.sendVerificationPrompt(
            createdUser.email,
            createdUser.username,
            verifyToken
        );
    }

    async signOut(userId: number): Promise<void> {
        await this.prisma.refreshToken.update({
            data: { revokedAt: new Date(), revokedReason: 'logged out' },
            where: { userId }
        });
    }

    async verify(token: string): Promise<void> {
        const user = await this.jwtService
            .verifyAsync<JWTPayload>(token, { secret: this.jwtConfig.verify.secret })
            .catch((error: JsonWebTokenError) => {
                if (error instanceof TokenExpiredError) {
                    throw new UnauthorizedException(error);
                }

                if (error instanceof JsonWebTokenError) {
                    throw new BadRequestException(error);
                }

                throw new InternalServerErrorException(
                    'Error occured while verifying the user verification token'
                );
            });

        await this.userService.update(user.sub, { email_verified: true });
    }

    async recoverAccount(email: string): Promise<void> {
        const user = await this.userService.getByEmail(email).catch(() => null);

        if (!user) {
            return;
        }

        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(new Date().getTime() + this.passwordExpiryDuration);
        await this.prisma.passwordResetToken.create({
            data: {
                token,
                expiresAt: tokenExpiry,
                userId: user.id
            }
        });

        await this.mail.sendAccountRecoveryPrompt(email, user.username, token);
    }

    async resetPassword(password: string, token: string): Promise<void> {
        const { userId, id: tokenId } = await this.prisma.passwordResetToken
            .findFirstOrThrow({
                where: {
                    token,
                    expiresAt: { gt: new Date() }
                },
                select: { userId: true, id: true }
            })
            .catch(() => {
                throw new BadRequestException('Invalid or expired reset token');
            });

        // update password
        await this.userService.update(userId, {
            passwordHash: await bcrypt.hash(password, HASH_SALT)
        });

        // delete token
        await this.prisma.passwordResetToken.delete({
            where: { id: tokenId }
        });
    }

    async refreshToken(req: Request, refreshToken: string): Promise<JWTTokens> {
        const jwt = await this.jwtService.verifyAsync<JWTPayload>(refreshToken, {
            secret: this.jwtConfig.refresh.secret
        });

        const userId = jwt.sub;
        const username = jwt.username;
        const stored = await this.prisma.refreshToken.findUnique({ where: { userId } });

        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw new ForbiddenException('Invalid or expired refresh token');
        }

        const isMatchingToken = await bcrypt.compare(refreshToken, stored.tokenHash);
        if (!isMatchingToken) {
            throw new ForbiddenException(
                'Provided token does not match stored token for user'
            );
        }

        return await this.generateAndStoreTokens(
            userId,
            username,
            req.ip ?? '[unknown IP]'
        );
    }

    private async generateAndStoreTokens(
        userId: number,
        username: string,
        createdByIp: string
    ): Promise<JWTTokens> {
        const { accessToken, refreshToken, ...tokenInfo } = this.createTokens(
            userId,
            username
        );

        const dbToken: Prisma.RefreshTokenUncheckedCreateInput = {
            tokenHash: await bcrypt.hash(refreshToken, HASH_SALT),
            issuedAt: new Date(tokenInfo.iat * 1000),
            expiresAt: new Date(tokenInfo.exp * 1000),
            createdByIp,
            userId
        };

        await this.prisma.refreshToken.upsert({
            create: dbToken,
            update: dbToken,
            where: { userId: dbToken.userId }
        });

        return { accessToken, refreshToken };
    }

    private createTokens(userId: number, username: string): JWTTokens & JWTPayload {
        const { secret, expiry: expiresIn } = this.jwtConfig.refresh;

        const payload = { sub: userId, username };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { secret, expiresIn });

        const info = this.jwtService.decode<JWTPayload>(refreshToken);

        return {
            accessToken,
            refreshToken,
            ...info
        };
    }
}
