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
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    minutes,
    seconds,
    Throttle,
    ThrottlerGetTrackerFunction
} from '@nestjs/throttler';
import { CookieOptions, Request, Response } from 'express';
import { Config } from 'src/config/validation-schema';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { LocalAuthGuard } from 'src/core/auth/local/local.guard';
import { RequestWithUser } from 'src/core/auth/local/local.strategy';
import { Cookies } from 'src/core/decorators/cookie/cookie.decorator';
import { AuthService } from './auth.service';

export interface SignupRequest {
    email: string;
    username: string;
    password: string;
}

const REFRESH_TOKEN_COOKIE_KEY = 'refresh_token';

const refreshCookieOptions: (expiry: number) => CookieOptions = (expiry) => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: false,
    path: '/auth',
    maxAge: expiry
});

const trackByEmail: ThrottlerGetTrackerFunction = (req) => {
    const request = req as Request;
    const email = (request.body as Record<string, string | undefined>)['email'];
    const ip = request.ip;
    return email || ip || request.url;
};

@Throttle({ long: { limit: 3, ttl: minutes(1) } })
@Controller('auth')
export class AuthController {
    private readonly _refreshTokenExpiry: number;

    constructor(
        config: ConfigService,
        private authService: AuthService
    ) {
        this._refreshTokenExpiry = config.getOrThrow(Config.REFRESH_TOKEN_EXP);
    }

    @Throttle({ long: { ttl: seconds(60), limit: 10 } })
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

        res.cookie(
            REFRESH_TOKEN_COOKIE_KEY,
            refreshToken,
            refreshCookieOptions(this._refreshTokenExpiry)
        );

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
        @Res({ passthrough: true }) res: Response,
        @Cookies(REFRESH_TOKEN_COOKIE_KEY) refreshToken?: string
    ): Promise<{ message: string }> {
        if (!refreshToken) {
            throw new BadRequestException('Missing refresh token');
        }

        await this.authService.signOut(refreshToken).catch(() => {
            throw new ForbiddenException('Invalid or expired refresh token');
        });

        res.clearCookie(
            REFRESH_TOKEN_COOKIE_KEY,
            refreshCookieOptions(this._refreshTokenExpiry)
        );

        return { message: 'Logged out successfully' };
    }

    @HttpCode(HttpStatus.OK)
    @Post('verify-account/:token')
    async verify(@Param('token') token: string): Promise<{ valid: boolean }> {
        await this.authService.verifyAccount(token);
        return { valid: true };
    }

    @Throttle({ long: { ttl: minutes(1), limit: 1 } })
    @HttpCode(HttpStatus.OK)
    @Post('resend-verification')
    async resendVerification(@Body('username') username: string): Promise<void> {
        await this.authService.resendVerification(username);
    }

    @Throttle({
        medium: { ttl: minutes(10), limit: 3 },
        long: { ttl: minutes(10), limit: 1, getTracker: trackByEmail }
    })
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
        @Res({ passthrough: true }) res: Response,
        @Cookies(REFRESH_TOKEN_COOKIE_KEY) refreshToken?: string
    ): Promise<{ accessToken: string }> {
        if (!refreshToken) {
            throw new BadRequestException('Missing refresh token');
        }

        const { accessToken, refreshToken: newRefreshToken } = await this.authService
            .refreshAccessToken(refreshToken, req.ip ?? '[unknown IP]')
            .catch((error: Error) => {
                res.clearCookie(
                    REFRESH_TOKEN_COOKIE_KEY,
                    refreshCookieOptions(this._refreshTokenExpiry)
                );

                throw new UnauthorizedException(
                    'Could not refresh access token',
                    error.message
                );
            });

        res.cookie(
            REFRESH_TOKEN_COOKIE_KEY,
            newRefreshToken,
            refreshCookieOptions(this._refreshTokenExpiry)
        );

        return { accessToken };
    }
}
