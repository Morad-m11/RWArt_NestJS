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
        data: Array.from({ length: 20 }, (_, i) => ({
            authorId: (i % 3) + 1,
            title: `Post Title ${i}`,
            description: `Post Description ${i}`,
            imageId: `cld-sample-${(i % 9) + 1}`,
            createdAt: new Date(Date.UTC(2025, 0, i))
        }))
    });

    await prisma.tag.createMany({
        data: [
            { category: 'Type', name: 'Art' },
            { category: 'Character', name: 'Survivor' },
            { category: 'Style', name: 'Sketch' }
        ]
    });

    await prisma.post.create({
        data: {
            authorId: 3,
            title: 'Slugcat in a box',
            description: 'Do slugcats love boxes as much as regular cats do?',
            imageId: 'slugcat_box_ppgtse',
            createdAt: new Date(Date.UTC(2025, 0, 30)),
            tags: { connect: [{ id: 1 }, { id: 2 }, { id: 3 }] }
        }
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
