// src/auth/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserJwt } from 'src/user/user.service';

export type RequestWithUser = Request & { user: UserJwt };

export const User = createParamDecorator(
   (data: keyof UserJwt | undefined, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;
      return data ? user[data] : user;
   },
);
