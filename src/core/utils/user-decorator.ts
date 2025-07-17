// src/auth/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JWTPayload } from 'src/core/jwt.module';

export type RequestWithUser = Request & { user: JWTPayload };

/** Decorator to extract the user object assigned by the AuthGuard */
export const User = createParamDecorator(
    (data: keyof JWTPayload | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<RequestWithUser>();
        const user = request.user;
        return data ? user[data] : user;
    },
);
