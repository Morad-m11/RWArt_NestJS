import { Injectable } from '@nestjs/common';
import { ThirdPartyAccount, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

const HASH_SALT = 10;

const SLUG_CATS = [
    'survivor',
    'monk',
    'hunter',
    'gourmand',
    'spearmaster',
    'artificer',
    'rivulet',
    'saint'
];

type CreateArgs = Pick<User, 'email' | 'username'> & {
    password: string;
};

type CreateThirdPartyArgs = Pick<User, 'email' | 'username'> &
    Pick<ThirdPartyAccount, 'provider' | 'providerUserId'>;

type UpdateArgs = Partial<Pick<User, 'username' | 'picture'>>;

type FindLocalFilters = Partial<Pick<User, 'id' | 'email' | 'username'>>;

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async create(user: CreateArgs): Promise<User> {
        return await this.prisma.user.create({
            data: {
                email: user.email,
                username: user.username,
                picture: this.randomPicture(),
                passwordHash: await this.hashPassword(user.password)
            }
        });
    }

    async createThirdParty(user: CreateThirdPartyArgs): Promise<User> {
        return await this.prisma.user.create({
            data: {
                email: user.email,
                username: user.username,
                picture: this.randomPicture(),
                email_verified: true,
                thirdPartyAccount: {
                    create: {
                        provider: user.provider,
                        providerUserId: user.providerUserId
                    }
                }
            }
        });
    }

    async updateProfile(id: User['id'], user: UpdateArgs): Promise<void> {
        await this.prisma.user.update({
            data: { username: user.username, picture: user.picture },
            where: { id }
        });
    }

    async updatePassword(id: User['id'], password: string): Promise<void> {
        await this.prisma.user.update({
            data: { passwordHash: await this.hashPassword(password) },
            where: { id }
        });
    }

    async verifyUser(id: User['id']): Promise<User> {
        return await this.prisma.user.update({
            data: { email_verified: true },
            where: { id }
        });
    }

    async exists({ id, email, username }: FindLocalFilters): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: {
                ...(id ? { id } : {}),
                ...(email ? { email: { equals: email, mode: 'insensitive' } } : {}),
                ...(username
                    ? { username: { equals: username, mode: 'insensitive' } }
                    : {})
            }
        });

        return count > 0;
    }

    async findOne({ id, email, username }: FindLocalFilters): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                ...(id ? { id } : {}),
                ...(email ? { email: { equals: email, mode: 'insensitive' } } : {}),
                ...(username
                    ? { username: { equals: username, mode: 'insensitive' } }
                    : {})
            }
        });
    }

    async findOneLocal({ id, email, username }: FindLocalFilters): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                ...(id ? { id } : {}),
                ...(email ? { email: { equals: email, mode: 'insensitive' } } : {}),
                ...(username
                    ? { username: { equals: username, mode: 'insensitive' } }
                    : {}),
                thirdPartyAccount: null
            }
        });
    }

    async comparePassword(pass: string, hashed: string): Promise<boolean> {
        return await bcrypt.compare(pass, hashed);
    }

    private async hashPassword(rawValue: string): Promise<string> {
        return await bcrypt.hash(rawValue, HASH_SALT);
    }

    private randomPicture(): string {
        return SLUG_CATS[Math.floor(Math.random() * SLUG_CATS.length)];
    }
}
