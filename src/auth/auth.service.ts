import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserJwt } from './auth.controller';

interface JWTTokenResponse {
   accessToken: string;
   refreshToken: string;
}

@Injectable()
export class AuthService {
   private readonly refreshSecret: string;
   private readonly refreshExpiration: string;

   constructor(
      private userService: UserService,
      private jwtService: JwtService,
      private config: ConfigService,
   ) {
      this.refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
      this.refreshExpiration = this.config.getOrThrow<string>('JWT_REFRESH_EXPIRATION');
   }

   signIn(username: string, pass: string): JWTTokenResponse {
      const user = this.userService.findOne(username);

      if (user?.password !== pass) {
         throw new UnauthorizedException();
      }

      const tokens = this.signTokens(user.id, user.username);
      return tokens;
   }

   refresh(refreshToken: string): JWTTokenResponse {
      const secret = this.refreshSecret;
      const user = this.jwtService.verify<UserJwt>(refreshToken, { secret });
      const tokens = this.signTokens(user.sub, user.username);
      return tokens;
   }

   private signTokens(userId: number, username: string): JWTTokenResponse {
      const secret = this.refreshSecret;
      const expiresIn = this.refreshExpiration;

      const payload = { sub: userId, username: username };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { secret, expiresIn });

      return { accessToken, refreshToken };
   }
}
