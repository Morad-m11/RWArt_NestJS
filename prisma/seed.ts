import bcrypt from 'bcrypt';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
   const johnData: User = {
      id: 1,
      email: 'john@prisma.io',
      name: 'Johnny',
      passwordHash: bcrypt.hashSync('changeme', 10),
   };

   const mariaData: User = {
      id: 2,
      email: 'maria@prisma.io',
      name: 'Maria',
      passwordHash: bcrypt.hashSync('guess', 10),
   };

   const john = await prisma.user.upsert({
      where: { id: johnData.id },
      update: johnData,
      create: johnData,
   });

   const maria = await prisma.user.upsert({
      where: { id: mariaData.id },
      update: mariaData,
      create: mariaData,
   });

   console.log({ john, maria });
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
