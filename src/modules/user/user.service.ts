import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/core/prisma.service';

@Injectable()
export class UserService {
   constructor(private prisma: PrismaService) {}

   async findOne(username: string): Promise<User | null> {
      return await this.prisma.user.findFirst({
         where: { name: { equals: username, mode: 'insensitive' } },
      });
   }
}
