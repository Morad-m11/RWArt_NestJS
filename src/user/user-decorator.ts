// src/auth/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserJwt } from 'src/auth/auth.controller';

export type RequestWithUser = Request & { user: UserJwt };

export const User = createParamDecorator(
   (data: keyof UserJwt | undefined, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;
      return data ? user[data] : user;
   },
);
