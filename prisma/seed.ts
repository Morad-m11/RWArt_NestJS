import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    await createUsers();
    await createTags();
    await createPosts();
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

async function createUsers() {
    await prisma.user.createMany({
        data: [
            {
                email: 'john@prisma.io',
                username: 'Johnny',
                passwordHash: await bcrypt.hash('changeme', 10),
                picture: 'survivor',
                email_verified: true
            },
            {
                email: 'maria@prisma.io',
                username: 'Maria',
                passwordHash: await bcrypt.hash('guess', 10),
                picture: 'survivor',
                email_verified: true
            },
            {
                email: 'fakemail',
                username: 'lajiao',
                passwordHash: await bcrypt.hash('guess', 10),
                picture: 'survivor',
                email_verified: true
            },
            {
                email: 'fakemail2',
                username: 'Div64',
                passwordHash: await bcrypt.hash('guess', 10),
                picture: 'saint',
                email_verified: true
            }
        ]
    });
}

async function createTags() {
    await prisma.tag.createMany({
        data: [
            { category: 'type', name: 'Artwork' },
            { category: 'type', name: 'Animation' },
            { category: 'character', name: 'Slugcat' },
            { category: 'style', name: 'Sketch' },
            { category: 'style', name: 'Pixelart' }
        ]
    });
}

async function createPosts() {
    await prisma.post.createMany({
        data: Array.from({ length: 20 }, (_, i) => ({
            authorId: (i % 3) + 1,
            title: `Post Title ${i}`,
            description: `Post Description ${i}`,
            imageId: `cld-sample-${(i % 9) + 1}`,
            createdAt: new Date(Date.UTC(2025, 0, i))
        }))
    });

    await prisma.post.create({
        data: {
            authorId: 3,
            title: 'Slugcat in a box',
            description: 'Do slugcats love boxes as much as regular cats do?',
            imageId: 'slugcat_box_ppgtse',
            createdAt: new Date(Date.UTC(2025, 0, 23)),
            tags: { connect: [{ id: 1 }, { id: 3 }, { id: 4 }] }
        }
    });

    await prisma.post.create({
        data: {
            authorId: 3,
            title: 'Good morning Rivulet',
            imageId: 'RW_Rivulet_Bounce_iohqsg',
            createdAt: new Date(Date.UTC(2025, 0, 22)),
            tags: { connect: [{ id: 2 }, { id: 3 }, { id: 5 }] }
        }
    });

    await prisma.post.create({
        data: {
            authorId: 4,
            title: 'The Warper',
            imageId: 'SlugPole_utxirf',
            createdAt: new Date(Date.UTC(2025, 0, 21)),
            tags: { connect: [{ id: 1 }, { id: 5 }] }
        }
    });

    await prisma.post.create({
        data: {
            authorId: 4,
            title: 'Always lurking',
            imageId: 'Wotcher_rfxcb4',
            createdAt: new Date(Date.UTC(2025, 0, 24)),
            tags: { connect: [{ id: 1 }, { id: 5 }] }
        }
    });
}
