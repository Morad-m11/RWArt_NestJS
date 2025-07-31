import {
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LocalAuthGuard } from 'src/core/auth/local/local.guard';
import { RequestWithUser } from 'src/core/utils/user-decorator';
import { AuthService } from './auth.service';

const REFRESH_TOKEN_COOKIE_KEY = 'refresh_token';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ accessToken: string }> {
        const { accessToken, refreshToken } =
            await this.authService.generateAndStoreTokens(
                req.user.id,
                req.user.name,
                req.ip ?? '[unknown IP]',
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
