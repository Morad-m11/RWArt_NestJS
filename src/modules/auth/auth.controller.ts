import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Ip,
    Param,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { minutes, SkipThrottle, Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Cookies } from 'src/common/decorators/cookie.decorator';
import { JwtUserClaims, User } from 'src/common/decorators/user.decorator';
import { GoogleAuthGuard } from 'src/core/auth/google/google.guard';
import { RequestWithThirdPartyJwt } from 'src/core/auth/google/google.strategy';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { LocalAuthGuard } from 'src/core/auth/local/local.guard';
import { Config } from 'src/core/config/env-validation';
import { throttlerEmailTracker } from 'src/core/throttler.module';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';

const REFRESH_TOKEN_KEY = 'refresh_token';

@Throttle({ long: { ttl: minutes(1), limit: 3 } })
@Controller('auth')
export class AuthController {
    private _authCookieExpiry: number;

    constructor(
        config: ConfigService,
        private authService: AuthService
    ) {
        this._authCookieExpiry = config.getOrThrow<number>(Config.REFRESH_TOKEN_EXP);
    }

    @SkipThrottle({ long: true })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getAuthUser(@User('id') userId: number): Promise<JwtUserClaims> {
        return await this.authService.getAuthUser(userId);
    }

    @Throttle({ long: { ttl: minutes(1), limit: 5 } })
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(
        @Ip() ip: string = '[unknown IP]',
        @User() user: JwtUserClaims,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ accessToken: string }> {
        const { accessToken, refreshToken } = await this.authService
            .signIn(user.id, user.username, ip)
            .catch((error: Error) => {
                throw new BadRequestException('User creation failed', {
                    description: error.message
                });
            });

        this.setAuthCookie(res, refreshToken);

        return { accessToken };
    }

    @UseGuards(GoogleAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('google')
    async signInWithGoogle(
        @Req() req: RequestWithThirdPartyJwt,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ accessToken: string }> {
        const { accessToken, refreshToken } = await this.authService.signInThirdParty(
            req.user,
            req.ip ?? '[unknown IP]'
        );

        this.setAuthCookie(res, refreshToken);

        return { accessToken };
    }

    @HttpCode(HttpStatus.OK)
    @Post('signup')
    async signUp(@Body() body: SignupDto): Promise<void> {
        await this.authService.signUp(body);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async signOut(
        @Res({ passthrough: true }) res: Response,
        @Cookies(REFRESH_TOKEN_KEY) refreshToken?: string
    ): Promise<{ message: string }> {
        if (!refreshToken) {
            throw new BadRequestException('Missing refresh token');
        }

        await this.authService.signOut(refreshToken).catch(() => {
            throw new ForbiddenException('Invalid or expired refresh token');
        });

        this.clearAuthCookie(res);

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
        long: { ttl: minutes(10), limit: 1, getTracker: throttlerEmailTracker }
    })
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    async recoverAccount(@Body('email') email: string) {
        await this.authService.recoverAccount(email);
    }

    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        await this.authService.resetPassword(body.token, body.password);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Cookies(REFRESH_TOKEN_KEY) refreshToken?: string
    ): Promise<{ accessToken: string }> {
        if (!refreshToken) {
            throw new BadRequestException('Missing refresh token');
        }

        const { accessToken, refreshToken: newRefreshToken } = await this.authService
            .refreshAccessToken(refreshToken, req.ip ?? '[unknown IP]')
            .catch((error: Error) => {
                this.clearAuthCookie(res);

                throw new UnauthorizedException(
                    'Could not refresh access token',
                    error.message
                );
            });

        this.setAuthCookie(res, newRefreshToken);

        return { accessToken };
    }

    setAuthCookie(res: Response, refreshToken: string) {
        res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
            path: '/auth',
            maxAge: this._authCookieExpiry
        });
    }

    clearAuthCookie(res: Response<any, Record<string, any>>) {
        res.clearCookie(REFRESH_TOKEN_KEY, {
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
            path: '/auth',
            maxAge: this._authCookieExpiry
        });
    }
}
