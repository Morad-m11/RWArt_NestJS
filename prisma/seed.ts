import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.createMany({
        data: [
            {
                email: 'john@prisma.io',
                name: 'Johnny',
                createdAt: new Date(),
                passwordHash: bcrypt.hashSync('changeme', 10),
                email_verified: true
            },
            {
                email: 'maria@prisma.io',
                name: 'Maria',
                createdAt: new Date(),
                passwordHash: bcrypt.hashSync('guess', 10),
                email_verified: true
            }
        ]
    });
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
