import { config as loadEnv } from 'dotenv';
import { PrismaClient } from '@prisma/client';

import { hashPassword } from '../src/utils/password.js';

loadEnv();

const prisma = new PrismaClient();

const run = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set for seeding');
  }

  const passwordHash = await hashPassword(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      fullName: 'Default Admin'
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      fullName: 'Default Admin',
      mobileNumber: '0000000000',
      accounts: {
        create: {
          accountNumber: 'ADMIN-ACCOUNT',
          status: 'ACTIVE'
        }
      }
    }
  });

  console.info('Seed completed');
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

