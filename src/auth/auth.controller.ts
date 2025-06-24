import {
   Body,
   Controller,
   ForbiddenException,
   Get,
   HttpCode,
   HttpStatus,
   Post,
   Req,
   Res,
   UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/core/auth.guard';
import { User } from 'src/user/user-decorator';
import { StoredUser } from 'src/user/user.service';
import { AuthService } from './auth.service';

export interface UserJwt {
   username: string;
   sub: number;
   iat: number;
   exp: number;
}

@Controller('auth')
export class AuthController {
   constructor(private authService: AuthService) {}

   @HttpCode(HttpStatus.OK)
   @Post('login')
   signIn(
      @Body() credentials: StoredUser,
      @Res({ passthrough: true }) res: Response,
   ): { accessToken: string } {
      const { username, password } = credentials;
      const { accessToken, refreshToken } = this.authService.signIn(username, password);

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

   @HttpCode(HttpStatus.OK)
   @UseGuards(AuthGuard)
   @Get('profile')
   profile(@User() user: UserJwt): UserJwt {
      return user;
   }
}
