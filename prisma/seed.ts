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
            },
            {
                email: 'fakemail',
                username: 'Angie',
                passwordHash: await bcrypt.hash('guess', 10),
                email_verified: true
            }
        ]
    });

    await prisma.post.createMany({
        data: [
            ...Array.from({ length: 20 }, (_, i) => ({
                authorId: (i % 3) + 1,
                title: `Post Title ${i}`,
                description: `Post Description ${i}`,
                imageId: `cld-sample-${(i % 9) + 1}`,
                createdAt: new Date(Date.UTC(2025, 0, i))
            })),
            {
                authorId: 3,
                title: 'Slugcat in a box',
                description: 'Do slugcats love boxes as much as regular cats do?',
                imageId: 'slugcat_box_ppgtse',
                createdAt: new Date(Date.UTC(2025, 0, 30)),
                tags: ['art', 'cats', 'boxes']
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
