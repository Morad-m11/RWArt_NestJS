import {
   Body,
   Controller,
   Get,
   HttpCode,
   HttpStatus,
   Post,
   Res,
   UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
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
   ): { message: string } {
      const { username, password } = credentials;
      const token = this.authService.signIn(username, password);

      res.cookie('access_token', token, {
         httpOnly: true,
         sameSite: 'lax',
         secure: false,
      });

      return { message: 'success' };
   }

   @HttpCode(HttpStatus.OK)
   @UseGuards(AuthGuard)
   @Get('me')
   me(@User() user: UserJwt): UserJwt {
      return user;
   }
}
