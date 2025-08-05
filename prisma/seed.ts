import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.createMany({
        data: [
            {
                email: 'john@prisma.io',
                username: 'Johnny',
                passwordHash: await bcrypt.hash('changeme', 10),
                email_verified: true
            },
            {
                email: 'maria@prisma.io',
                username: 'Maria',
                passwordHash: await bcrypt.hash('guess', 10),
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
