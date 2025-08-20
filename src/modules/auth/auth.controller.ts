import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Req,
    Res,
    UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Config } from 'src/config/validation-schema';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { RequestWithJwt } from 'src/core/auth/jwt/jwt.module';
import { LocalAuthGuard } from 'src/core/auth/local/local.guard';
import { RequestWithUser } from 'src/core/auth/local/local.strategy';
import { AuthService } from './auth.service';

const REFRESH_TOKEN_COOKIE_KEY = 'refresh_token';

export interface SignupRequest {
    email: string;
    username: string;
    password: string;
}

@Controller('auth')
export class AuthController {
    private readonly _refreshTokenExpiry: number;

    constructor(
        config: ConfigService,
        private authService: AuthService
    ) {
        this._refreshTokenExpiry = config.getOrThrow(Config.REFRESH_TOKEN_EXP);
    }

    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ accessToken: string }> {
        const { accessToken, refreshToken } = await this.authService
            .signIn(req.user.id, req.user.username, req.ip ?? '[unknown IP]')
            .catch((error: Error) => {
                throw new BadRequestException('User creation failed', {
                    description: error.message
                });
            });

        this.setRefreshTokenCookie(res, refreshToken);

        return { accessToken };
    }

    @HttpCode(HttpStatus.OK)
    @Post('signup')
    async signUp(@Body() body: SignupRequest): Promise<void> {
        await this.authService.signUp(body);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async signOut(
        @Req() req: RequestWithJwt,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ message: string }> {
        await this.authService.signOut(req.user.userId);

        this.clearRefreshTokenCookie(res);

        return { message: 'Logged out successfully' };
    }

    @HttpCode(HttpStatus.OK)
    @Post('verify-account/:token')
    async verify(@Param('token') token: string): Promise<{ valid: boolean }> {
        await this.authService.verifyAccount(token);
        return { valid: true };
    }

    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    async recoverAccount(@Body('email') email: string) {
        await this.authService.recoverAccount(email);
    }

    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    async resetPassword(@Body() body: { password: string; token: string }) {
        await this.authService.resetPassword(body.token, body.password);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ accessToken: string }> {
        const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY] as string | undefined;

        if (!refreshToken) {
            throw new ForbiddenException('Missing refresh token');
        }

        const { accessToken } = await this.authService
            .refreshAccessToken(refreshToken, req.ip ?? '[unknown IP]')
            .catch((error: Error) => {
                this.clearRefreshTokenCookie(res);

                throw new ForbiddenException(
                    'Could not refresh access token',
                    error.message
                );
            });

        this.setRefreshTokenCookie(res, refreshToken);

        return { accessToken };
    }

    private setRefreshTokenCookie(res: Response, token: string) {
        res.cookie(REFRESH_TOKEN_COOKIE_KEY, token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
            path: '/auth',
            maxAge: this._refreshTokenExpiry
        });
    }

    private clearRefreshTokenCookie(res: Response) {
        res.clearCookie(REFRESH_TOKEN_COOKIE_KEY);
    }
}
