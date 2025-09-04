import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.createMany({
        data: [
            {
                id: 0,
                email: 'john@prisma.io',
                username: 'Johnny',
                passwordHash: await bcrypt.hash('changeme', 10),
                email_verified: true
            },
            {
                id: 1,
                email: 'maria@prisma.io',
                username: 'Maria',
                passwordHash: await bcrypt.hash('guess', 10),
                email_verified: true
            }
        ]
    });

    await prisma.post.createMany({
        data: [
            {
                authorId: 0,
                title: 'Post Title 1',
                imageUrl: 'https://picsum.photos/250/400'
            },
            {
                authorId: 0,
                title: 'Post Title 2',
                imageUrl: 'https://picsum.photos/250/400'
            },
            {
                authorId: 1,
                title: 'Post Title 3',
                imageUrl: 'https://picsum.photos/250/400'
            },
            {
                authorId: 1,
                title: 'Post Title 4',
                imageUrl: 'https://picsum.photos/250/400'
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
