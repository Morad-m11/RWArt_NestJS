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

export type AuthRequest = {
   id: number;
   username: string;
   password: string;
};

@Controller('auth')
export class AuthController {
   constructor(private authService: AuthService) {}

   @HttpCode(HttpStatus.OK)
   @Post('login')
   async signIn(
      @Body() credentials: AuthRequest,
      @Res({ passthrough: true }) res: Response,
   ): Promise<{ accessToken: string }> {
      const { username, password } = credentials;
      const { accessToken, refreshToken } = await this.authService.signIn(
         username,
         password,
      );

      res.cookie('refresh_token', refreshToken, {
         httpOnly: true,
         sameSite: 'strict',
         secure: false,
         path: '/auth/refresh',
      });

      return { accessToken };
   }

   @HttpCode(HttpStatus.OK)
   @Post('refresh')
   refreshToken(
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response,
   ): {
      accessToken: string;
   } {
      const refreshToken = req.cookies['refresh_token'] as string;

      if (!refreshToken) {
         throw new ForbiddenException('Refresh token is missing');
      }

      try {
         const { accessToken } = this.authService.refresh(refreshToken);

         res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
            path: '/auth/refresh',
         });

         return { accessToken };
      } catch (error) {
         throw new ForbiddenException(error);
      }
   }
}
