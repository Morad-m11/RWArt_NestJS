import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export type JwtUserClaims = {
    id: number;
    username: string;
};

export const User = createParamDecorator(
    (property: keyof JwtUserClaims, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        const user = request.user as JwtUserClaims | undefined;

        if (!user) {
            return;
        }

        if (!property) {
            return user;
        }

        return user[property];
    }
);
