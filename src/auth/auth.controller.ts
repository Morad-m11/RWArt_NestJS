import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { StoredUser } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
   constructor(private authService: AuthService) {}

   @HttpCode(HttpStatus.OK)
   @Post('login')
   async signIn(
      @Body() signInDto: StoredUser,
      @Res({ passthrough: true }) res: Response,
   ): Promise<{ message: string }> {
      const token = await this.authService.signIn(signInDto.username, signInDto.password);
      res.cookie('access_token', token, {
         httpOnly: true,
         sameSite: 'lax',
         secure: false,
      });

      return { message: 'success' };
   }
}
