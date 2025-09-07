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

    await prisma.post.createMany({
        data: [
            {
                authorId: 1,
                title: 'Post Title 1',
                description: 'Post Description 1',
                imageId: 'main-sample'
            },
            {
                authorId: 1,
                title: 'Post Title 2',
                description: 'Post Description 2',
                imageId: 'cld-sample-5'
            },
            {
                authorId: 2,
                title: 'Post Title 3',
                description: 'Post Description 3',
                imageId: 'cld-sample-3'
            },
            {
                authorId: 2,
                title: 'Post Title 4',
                description: 'Post Description 4',
                imageId: 'cld-sample'
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
