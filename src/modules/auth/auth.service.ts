import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { JWTPayload } from 'src/core/jwt.module';
import { UserService } from '../user/user.service';

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

   async signIn(username: string, password: string): Promise<JWTTokenResponse> {
      const user = await this.userService.findOne(username);

      if (!user) {
         throw new UnauthorizedException('User does not exist');
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
         throw new UnauthorizedException('Password does not match');
      }

      return this.createTokens(user.id, user.name);
   }

   refresh(refreshToken: string): JWTTokenResponse {
      const secret = this.refreshSecret;
      const user = this.jwtService.verify<JWTPayload>(refreshToken, { secret });

      return this.createTokens(user.sub, user.username);
   }

   private createTokens(userId: number, username: string): JWTTokenResponse {
      const secret = this.refreshSecret;
      const expiresIn = this.refreshExpiration;

      const payload = { sub: userId, username: username };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { secret, expiresIn });

      return { accessToken, refreshToken };
   }
}
