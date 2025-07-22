import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/core/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async findByName(username: string): Promise<User> {
        const user = await this.prisma.user.findFirst({
            where: { name: { equals: username, mode: 'insensitive' } },
        });

        if (!user) {
            throw new NotFoundException(`User with name ${username} not found`);
        }

        return user;
    }

    async findById(id: number): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }
}
