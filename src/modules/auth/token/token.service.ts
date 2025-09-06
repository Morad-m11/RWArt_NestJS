import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, User } from '@prisma/client';
import crypto from 'crypto';
import { Config } from 'src/config/env-validation';
import { MailService } from 'src/core/services/mail/mail.service';
import { PrismaService } from 'src/core/services/prisma/prisma.service';

@Injectable()
export class TokenService {
    private readonly expiries: {
        refreshToken: number;
        verification: number;
        passwordReset: number;
    };

    constructor(
        config: ConfigService,
        private jwt: JwtService,
        private prisma: PrismaService,
        private mail: MailService
    ) {
        this.expiries = {
            refreshToken: config.getOrThrow(Config.REFRESH_TOKEN_EXP),
            verification: config.getOrThrow(Config.VERIFCATION_TOKEN_EXP),
            passwordReset: config.getOrThrow(Config.PASSWORD_RESET_EXP)
        };
    }

    async createVerificationToken(userId: number): Promise<string> {
        const token = this.createToken();

        const tokenData = {
            tokenHash: this.hashToken(token),
            expiresAt: this.getFutureDateOffset(this.expiries.verification),
            userId
        };

        await this.prisma.accountVerificationToken.upsert({
            create: tokenData,
            update: tokenData,
            where: { userId }
        });

        return token;
    }

    async findValidVerificationToken(
        verificationToken: string
    ): Promise<{ tokenId: number; userId: number }> {
        const tokenHash = this.hashToken(verificationToken);

        const { id, userId } =
            await this.prisma.accountVerificationToken.findFirstOrThrow({
                where: {
                    tokenHash,
                    expiresAt: { gt: new Date() }
                },
                select: { id: true, userId: true }
            });

        return {
            tokenId: id,
            userId
        };
    }

    async deleteVerificationToken(id: number) {
        await this.prisma.accountVerificationToken.delete({
            where: { id }
        });
    }

    async createPasswordResetToken(userId: number): Promise<string> {
        const token = this.createToken();

        const tokenData = {
            tokenHash: this.hashToken(token),
            expiresAt: this.getFutureDateOffset(this.expiries.passwordReset),
            userId
        };

        await this.prisma.passwordResetToken.upsert({
            create: tokenData,
            update: tokenData,
            where: { userId }
        });

        return token;
    }

    async findValidPasswordResetToken(
        resetToken: string
    ): Promise<{ tokenId: number; userId: number }> {
        const tokenHash = this.hashToken(resetToken);

        const { id, userId } = await this.prisma.passwordResetToken.findFirstOrThrow({
            where: {
                tokenHash,
                expiresAt: { gt: new Date() }
            },
            select: { id: true, userId: true }
        });

        return {
            tokenId: id,
            userId
        };
    }

    async deletePasswordResetToken(id: number) {
        await this.prisma.passwordResetToken.delete({
            where: { id }
        });
    }

    async createRefreshToken(userId: number, userIP: string): Promise<string> {
        const token = this.createToken();

        await this.prisma.refreshToken.create({
            data: {
                tokenHash: this.hashToken(token),
                expiresAt: this.getFutureDateOffset(this.expiries.refreshToken),
                createdByIp: userIP,
                user: {
                    connect: { id: userId }
                }
            }
        });

        return token;
    }

    async createAccessToken(id: number, username: string): Promise<string> {
        return await this.jwt.signAsync({ sub: id, username });
    }

    async refreshAccessToken(
        refreshToken: string,
        userIP: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const foundToken = await this.findRefreshToken(refreshToken);

        if (!foundToken || foundToken.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const user = foundToken.user;

        if (foundToken.revokedAt) {
            await this.revokeAllRefreshTokens(user.id);
            await this.mail.sendTokenReusedMail(user.email, user.username);
            throw new UnauthorizedException('Token reuse detected');
        }

        await this.revokeRefreshTokenById(foundToken.id, 'Rotated');

        return {
            accessToken: await this.createAccessToken(user.id, user.username),
            refreshToken: await this.createRefreshToken(user.id, userIP)
        };
    }

    async findRefreshToken(
        refreshToken: string
    ): Promise<(RefreshToken & { user: User }) | null> {
        const tokenHash = this.hashToken(refreshToken);

        return await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true }
        });
    }

    async revokeRefreshToken(token: string, reason: string) {
        const tokenHash = this.hashToken(token);

        await this.prisma.refreshToken.update({
            data: {
                revokedAt: new Date(),
                revokedReason: reason
            },
            where: { tokenHash }
        });
    }

    private async revokeRefreshTokenById(id: number, reason: string): Promise<void> {
        await this.prisma.refreshToken.update({
            data: {
                revokedAt: new Date(),
                revokedReason: reason
            },
            where: { id }
        });
    }

    private async revokeAllRefreshTokens(userId: number) {
        await this.prisma.refreshToken.updateMany({
            data: {
                revokedAt: new Date(),
                revokedReason: 'Token reuse detected'
            },
            where: {
                userId,
                revokedAt: null
            }
        });
    }

    private getFutureDateOffset(timeOffsetMS: number): Date {
        return new Date(new Date().getTime() + timeOffsetMS);
    }

    private createToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private hashToken(rawValue: string): string {
        return crypto.hash('sha256', rawValue, 'hex');
    }
}
