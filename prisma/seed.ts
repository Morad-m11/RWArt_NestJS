import bcrypt from 'bcrypt';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
   const john: User = {
      id: 1,
      email: 'john@prisma.io',
      name: 'Johnny',
      passwordHash: bcrypt.hashSync('changeme', 10),
   };

   const maria: User = {
      id: 2,
      email: 'maria@prisma.io',
      name: 'Maria',
      passwordHash: bcrypt.hashSync('guess', 10),
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
