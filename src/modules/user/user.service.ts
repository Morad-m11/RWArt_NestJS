import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/core/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async create(user: Prisma.UserCreateInput): Promise<Omit<User, 'passwordHash'>> {
        const createdUser = await this.prisma.user.create({
            data: user,
            omit: { passwordHash: true }
        });

        return createdUser;
    }

    async update(id: User['id'], user: Prisma.UserUpdateInput) {
        await this.prisma.user.update({ where: { id }, data: user });
    }

    async isUniqueUsername(name: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { name: { equals: name, mode: 'insensitive' } }
        });

        return count === 0;
    }

    async isUniqueEmail(email: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { email: { equals: email, mode: 'insensitive' } }
        });

        return count === 0;
    }

    async getByName(username: string): Promise<User> {
        const user = await this.prisma.user.findFirst({
            where: { name: { equals: username, mode: 'insensitive' } }
        });

        if (!user) {
            throw new NotFoundException(`User with name ${username} not found`);
        }

        return user;
    }

    async getById(id: number): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }
}
