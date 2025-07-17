import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import { JWTPayload } from 'src/core/jwt.module';
import { PrismaService } from 'src/core/prisma.service';
import { UserService } from '../user/user.service';

interface JWTTokens {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    private readonly refreshSecret: string;
    private readonly refreshExpiration: string;

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private config: ConfigService,
        private prisma: PrismaService,
    ) {
        this.refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
        this.refreshExpiration = this.config.getOrThrow<string>('JWT_REFRESH_EXPIRATION');
    }

    async signIn(req: Request, username: string, password: string): Promise<JWTTokens> {
        const user = await this.userService.findOne(username);

        if (!user) {
            throw new UnauthorizedException('User does not exist');
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedException('Password does not match');
        }

        return await this.generateAndStoreTokens(
            user.id,
            user.name,
            req.ip ?? '[unknown IP]',
        );
    }

    async refreshToken(req: Request, refreshToken: string): Promise<JWTTokens> {
        const jwt = this.jwtService.verify<JWTPayload>(refreshToken, {
            secret: this.refreshSecret,
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
                'Provided token does not match stored token for user',
            );
        }

        return await this.generateAndStoreTokens(
            userId,
            username,
            req.ip ?? '[unknown IP]',
        );
    }

    private async generateAndStoreTokens(
        userId: number,
        username: string,
        createdByIp: string,
    ): Promise<JWTTokens> {
        const { accessToken, refreshToken, ...tokenInfo } = this.createTokens(
            userId,
            username,
        );

        await this.upsertRefreshToken({
            tokenHash: await bcrypt.hash(refreshToken, 10),
            issuedAt: new Date(tokenInfo.iat * 1000),
            expiresAt: new Date(tokenInfo.exp * 1000),
            createdByIp,
            userId,
        });

        return { accessToken, refreshToken };
    }

    private createTokens(userId: number, username: string): JWTTokens & JWTPayload {
        const secret = this.refreshSecret;
        const expiresIn = this.refreshExpiration;

        const payload = { sub: userId, username: username };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { secret, expiresIn });

        const info = this.jwtService.decode<JWTPayload>(refreshToken);

        return {
            accessToken,
            refreshToken,
            ...info,
        };
    }

    private async upsertRefreshToken(token: Prisma.RefreshTokenUncheckedCreateInput) {
        await this.prisma.refreshToken.upsert({
            create: token,
            update: token,
            where: { userId: token.userId },
        });
    }
}
