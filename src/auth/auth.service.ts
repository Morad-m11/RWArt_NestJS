import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
   constructor(
      private userService: UserService,
      private jwtService: JwtService,
   ) {}

   signIn(username: string, pass: string): string {
      const user = this.userService.findOne(username);

      if (user?.password !== pass) {
         throw new UnauthorizedException();
      }

      const payload = { sub: user.userId, username: user.username };
      const token = this.jwtService.sign(payload);

      return token;
   }
}
