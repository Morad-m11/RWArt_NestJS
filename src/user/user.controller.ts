import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/auth.guard';
import { User } from './user-decorator';
import { UserJwt } from './user.service';

@Controller('user')
export class UserController {
   @UseGuards(AuthGuard)
   @Get('profile')
   getProfile(@User() user: UserJwt): UserJwt {
      return user;
   }
}
