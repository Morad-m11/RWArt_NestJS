// src/auth/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserJwt } from 'src/users/users.service';

export type RequestWithUser = Request & { user: UserJwt };

export const CurrentUser = createParamDecorator(
   (data: keyof UserJwt | undefined, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;
      return data ? user[data] : user;
   },
);
