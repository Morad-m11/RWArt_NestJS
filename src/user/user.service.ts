import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';

export type StoredUser = {
   id: number;
   username: string;
   password: string;
};

@Injectable()
export class UserService {
   constructor(private prisma: PrismaService) {}

   private readonly users: StoredUser[] = [
      {
         id: 1,
         username: 'john',
         password: 'changeme',
      },
      {
         id: 2,
         username: 'maria',
         password: 'guess',
      },
   ];

   findOne(username: string): StoredUser | undefined {
      return this.users.find((x) => x.username === username);
   }
}
