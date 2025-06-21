import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/auth.guard';

@Controller('user')
export class UserController {
   @UseGuards(AuthGuard)
   @Get('profile')
   getProfile() {
      return null;
   }
}
