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
                imageUrl:
                    'https://fastly.picsum.photos/id/428/250/400.jpg?hmac=BBNtpvgBaXoHkOUkxnpF1B82QYAMBpS5bNHi5jznFOQ'
            },
            {
                authorId: 1,
                title: 'Post Title 2',
                description: 'Post Description 2',
                imageUrl:
                    'https://fastly.picsum.photos/id/680/250/400.jpg?hmac=KhJSIl2GaiDb-sSDgN_wWun7zSTeQZdNm1aKBXZNRhA'
            },
            {
                authorId: 2,
                title: 'Post Title 3',
                description: 'Post Description 3',
                imageUrl:
                    'https://fastly.picsum.photos/id/132/250/400.jpg?hmac=7OiCbGvYmoP2l83tgRP2HREs7x73gXGPIseOUPKSdFE'
            },
            {
                authorId: 2,
                title: 'Post Title 4',
                description: 'Post Description 4',
                imageUrl:
                    'https://fastly.picsum.photos/id/583/250/400.jpg?hmac=S8DZuCMe7CsG5gIFrvwj_ArREh95NdhIH5Jssa84HaI'
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
