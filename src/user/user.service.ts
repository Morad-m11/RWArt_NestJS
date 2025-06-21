import { Injectable } from '@nestjs/common';

export type StoredUser = {
   userId: number;
   username: string;
   password: string;
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
