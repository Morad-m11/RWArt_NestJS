import {
    Body,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

interface AuthRequest {
    id: number;
    username: string;
    password: string;
}

const REFRESH_TOKEN_COOKIE_KEY = 'refresh_token';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(
        @Body() credentials: AuthRequest,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ accessToken: string }> {
        const { username, password } = credentials;
        const { accessToken, refreshToken } = await this.authService.signIn(
            req,
            username,
            password,
        );

        res.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
            path: '/auth',
        });

        return { accessToken };
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async signOut(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<void> {
        const refreshToken = this.extractRefreshToken(req);

        await this.authService.signOut(refreshToken);

        res.clearCookie(REFRESH_TOKEN_COOKIE_KEY);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ accessToken: string }> {
        const refreshToken = this.extractRefreshToken(req);

        try {
            const { accessToken } = await this.authService.refreshToken(
                req,
                refreshToken,
            );

            res.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                secure: false,
                path: '/auth',
            });

            return { accessToken };
        } catch (error) {
            res.clearCookie(REFRESH_TOKEN_COOKIE_KEY, {
                httpOnly: true,
                sameSite: 'strict',
                secure: false,
                path: '/auth',
            });

            throw new ForbiddenException(error);
        }
    }

    private extractRefreshToken(req: Request): string {
        const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY] as string;

        if (!refreshToken) {
            throw new ForbiddenException('Refresh token is missing');
        }

        return refreshToken;
    }
}
