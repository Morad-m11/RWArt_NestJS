import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/core/services/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async create(user: Prisma.UserCreateInput): Promise<User> {
        return await this.prisma.user.create({ data: user });
    }

    async update(id: User['id'], user: Prisma.UserUpdateInput) {
        await this.prisma.user.update({ where: { id }, data: user });
    }

    async isUniqueUsername(name: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { username: { equals: name, mode: 'insensitive' } }
        });

        return count === 0;
    }

    async isUniqueEmail(email: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { email: { equals: email, mode: 'insensitive' } }
        });

        return count === 0;
    }

    async findById(id: number): Promise<User | null> {
        return await this.prisma.user.findUnique({ where: { id } });
    }

    async findByName(username: string): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: { username: { equals: username, mode: 'insensitive' } }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } }
        });
    }
}
