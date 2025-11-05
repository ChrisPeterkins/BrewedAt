import { usersDb } from '../api/db';
import { hashPassword } from '../api/middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createAdmin() {
  console.log('\n═══════════════════════════════════════');
  console.log('  BrewedAt - Create Admin User');
  console.log('═══════════════════════════════════════\n');

  try {
    const email = await question('Email address: ');

    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = usersDb.getByEmail(email);
    if (existingUser) {
      console.error(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    const displayName = await question('Display name: ');
    const password = await question('Password: ');

    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    const confirmPassword = await question('Confirm password: ');

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      process.exit(1);
    }

    // Hash password
    console.log('\n⏳ Creating admin user...');
    const passwordHash = await hashPassword(password);

    // Create user
    const user = usersDb.create({
      id: uuidv4(),
      email,
      displayName: displayName || undefined,
      role: 'admin',
      passwordHash
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\nUser details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Display Name: ${user.displayName || 'Not set'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
