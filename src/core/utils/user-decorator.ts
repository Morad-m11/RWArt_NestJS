// src/auth/decorators/user.decorator.ts
import { User } from '@prisma/client';
import { Request } from 'express';
import { JWTPayload } from '../auth/jwt/jwt.module';

export type RequestWithUser = Request & { user: User };

export type RequestWithJwt = Request & {
    user: {
        userId: JWTPayload['sub'];
        username: JWTPayload['username'];
    };
};

// /** Decorator to extract the user object assigned by the AuthGuard */
// export const User = createParamDecorator(
//     (data: keyof JWTPayload | undefined, ctx: ExecutionContext) => {
//         const request = ctx.switchToHttp().getRequest<RequestWithUser>();
//         const user = request.user;
//         return data ? user[data] : user;
//     },
// );
