const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Hash the password
    const password = 'FirstTime123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'KangarooJack@email.com' }
    });

    if (existing) {
      process.exit(0);
    }

    // Create the user with requirePasswordReset flag (we'll add this to schema)
    await prisma.user.create({
      data: {
        email: 'KangarooJack@email.com',
        password: hashedPassword,
        emailVerified: true,
        mfaEnabled: false,
      },
    });

    process.exit(0);
  } catch (error) {
    process.exit(0);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
