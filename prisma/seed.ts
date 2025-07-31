import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { HASH_SALT } from 'src/core/hash';

const prisma = new PrismaClient();

async function main() {
    const john: User = {
        id: 1,
        email: 'john@prisma.io',
        name: 'Johnny',
        createdAt: new Date(),
        passwordHash: bcrypt.hashSync('changeme', HASH_SALT),
    };

    const maria: User = {
        id: 2,
        email: 'maria@prisma.io',
        name: 'Maria',
        createdAt: new Date(),
        passwordHash: bcrypt.hashSync('guess', HASH_SALT),
    };

    await prisma.user.upsert({
        where: { id: john.id },
        update: john,
        create: john,
    });

    await prisma.user.upsert({
        where: { id: maria.id },
        update: maria,
        create: maria,
    });

    await prisma.refreshToken.deleteMany();
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
