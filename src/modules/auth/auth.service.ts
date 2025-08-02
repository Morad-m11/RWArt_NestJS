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
import { Request } from 'express';
import { JWTPayload } from 'src/core/auth/jwt/jwt.module';
import { HASH_SALT } from 'src/core/hash';
import { MailService } from 'src/core/mail/mail.service';
import { PrismaService } from 'src/core/prisma.service';
import { UserService } from '../user/user.service';
import { SignupRequest } from './auth.controller';

interface JWTTokens {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    private readonly refreshSecret: string;
    private readonly refreshExpiration: string;
    private readonly verifySecret: string;
    private readonly verifyExpiration: string;

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private config: ConfigService,
        private prisma: PrismaService,
        private mail: MailService
    ) {
        this.refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
        this.refreshExpiration = this.config.getOrThrow<string>('JWT_REFRESH_EXP');
        this.verifySecret = this.config.getOrThrow<string>('JWT_VERIFY_SECRET');
        this.verifyExpiration = this.config.getOrThrow<string>('JWT_VERIFY_EXP');
    }

    async validateUser(name: string, pass: string): Promise<User> {
        const user = await this.userService.getByName(name).catch(() => null);

        if (!user) {
            throw new UnauthorizedException();
        }

        const passwordMatches = await bcrypt.compare(pass, user.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedException();
        }

        if (!user.email_verified) {
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
            name: user.username,
            passwordHash: await bcrypt.hash(user.password, HASH_SALT),
            email_verified: false,
            createdAt: new Date()
        });

        const verifyToken = await this.jwtService.signAsync(
            { sub: createdUser.id, username: createdUser.name },
            { secret: this.verifySecret, expiresIn: this.verifyExpiration }
        );

        await this.mail.sendVerificationPrompt(createdUser.name, verifyToken);
    }

    async signOut(userId: number): Promise<void> {
        await this.prisma.refreshToken.update({
            data: { revokedAt: new Date(), revokedReason: 'logged out' },
            where: { userId }
        });
    }

    async verify(token: string): Promise<void> {
        const user = await this.jwtService
            .verifyAsync<JWTPayload>(token, { secret: this.verifySecret })
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

    async refreshToken(req: Request, refreshToken: string): Promise<JWTTokens> {
        const jwt = this.jwtService.verify<JWTPayload>(refreshToken, {
            secret: this.refreshSecret
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
        const secret = this.refreshSecret;
        const expiresIn = this.refreshExpiration;

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
