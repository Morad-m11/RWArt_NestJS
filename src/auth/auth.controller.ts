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
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from './user-decorator';
import { StoredUser, UserJwt } from 'src/users/users.service';

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

   @UseGuards(AuthGuard)
   @Get('profile')
   getProfile(@CurrentUser() user: UserJwt): UserJwt {
      return user;
   }
}
