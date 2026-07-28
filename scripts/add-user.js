const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Hash the password
    const password = 'FirstTime123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: 'KangarooJack@email.com',
        password: hashedPassword,
        emailVerified: true,
        mfaEnabled: false,
      },
    });

    console.log('✅ User created successfully:');
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Password: FirstTime123`);
    console.log(`   Verified: ${user.emailVerified}`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ User with this email already exists');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
