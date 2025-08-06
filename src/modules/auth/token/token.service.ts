import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { Config } from 'src/config/validation-schema';
import { JWTPayload } from 'src/core/auth/jwt/jwt.module';
import { PrismaService } from 'src/core/prisma.service';

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
        private prisma: PrismaService
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

        await this.prisma.passwordResetToken.create({
            data: {
                tokenHash: this.hashToken(token),
                expiresAt: this.getFutureDateOffset(this.expiries.passwordReset),
                userId
            }
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

        const dbToken: Prisma.RefreshTokenCreateInput & Prisma.RefreshTokenUpdateInput = {
            tokenHash: this.hashToken(token),
            expiresAt: this.getFutureDateOffset(this.expiries.refreshToken),
            createdByIp: userIP,
            user: {
                connect: { id: userId }
            }
        };

        await this.prisma.refreshToken.upsert({
            create: dbToken,
            update: dbToken,
            where: { userId }
        });

        return token;
    }

    async findValidRefreshToken(
        refreshToken: string
    ): Promise<{ userId: number; username: string }> {
        const tokenHash = this.hashToken(refreshToken);

        const { user } = await this.prisma.refreshToken.findFirstOrThrow({
            where: {
                tokenHash,
                revokedAt: null,
                expiresAt: { gt: new Date() }
            },
            select: {
                user: {
                    select: { id: true, username: true }
                }
            }
        });

        return {
            userId: user.id,
            username: user.username
        };
    }

    async createAccessToken(
        payload: Pick<JWTPayload, 'sub' | 'username'>
    ): Promise<string> {
        return await this.jwt.signAsync(payload);
    }

    async revokeRefreshToken(userId: number, reason: string) {
        await this.prisma.refreshToken.update({
            data: {
                revokedAt: new Date(),
                revokedReason: reason
            },
            where: { userId }
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
