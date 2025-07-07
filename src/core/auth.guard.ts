import {
   CanActivate,
   ExecutionContext,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWTPayload } from './jwt.module';
import { RequestWithUser } from '../user/user-decorator';

@Injectable()
export class AuthGuard implements CanActivate {
   constructor(private jwtService: JwtService) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const access_token = this.extractAccessTokenFromHeader(request);

      if (!access_token) {
         throw new UnauthorizedException();
      }

      const userPayload = await this.jwtService
         .verifyAsync<JWTPayload>(access_token)
         .catch((err: unknown) => {
            throw new UnauthorizedException(err);
         });

      // We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request.user = userPayload;

      return true;
   }

   private extractAccessTokenFromHeader(request: Request): string | undefined {
      const authheader = request.headers.authorization;
      const [type, token] = authheader?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
   }
}
