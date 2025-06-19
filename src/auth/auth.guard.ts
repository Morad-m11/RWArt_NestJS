import {
   CanActivate,
   ExecutionContext,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserJwt } from 'src/users/users.service';
import { RequestWithUser } from './user-decorator';

@Injectable()
export class AuthGuard implements CanActivate {
   constructor(private jwtService: JwtService) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
         throw new UnauthorizedException();
      }

      const userPayload = await this.jwtService
         .verifyAsync<UserJwt>(token)
         .catch((err: unknown) => {
            throw new UnauthorizedException(err);
         });

      // We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request.user = userPayload;

      return true;
   }

   private extractTokenFromHeader(request: Request): string | undefined {
      return request.cookies['access_token'] as string;
   }
}
