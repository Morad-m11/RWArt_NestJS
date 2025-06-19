import { Injectable } from '@nestjs/common';

export type StoredUser = {
   userId: number;
   username: string;
   password: string;
};

export type UserJwt = {
   sub: 1;
   username: 'john';
   iat: 1750331142;
   exp: 1750332042;
};

@Injectable()
export class UserService {
   private readonly users: StoredUser[] = [
      {
         userId: 1,
         username: 'john',
         password: 'changeme',
      },
      {
         userId: 2,
         username: 'maria',
         password: 'guess',
      },
   ];

   findOne(username: string): StoredUser | undefined {
      return this.users.find((x) => x.username === username);
   }
}
