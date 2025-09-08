import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserJWT } from 'src/core/auth/jwt/jwt.module';

export const User = createParamDecorator(
    (property: keyof UserJWT, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        const user = request.user as UserJWT | undefined;

        if (!user) {
            return;
        }

        if (!property) {
            return user;
        }

        return user[property];
    }
);
