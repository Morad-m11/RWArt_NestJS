import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserJWT } from 'src/core/auth/jwt/jwt.module';

export const User = createParamDecorator<unknown, UserJWT>(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        return request.user as UserJWT;
    }
);
