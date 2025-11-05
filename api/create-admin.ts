import { usersDb } from './db';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

async function createAdmin() {
  const email = 'admin@brewedat.com';
  const password = 'admin123'; // Change this password after first login!

  // Check if user already exists
  const existing = usersDb.getByEmail(email);
  if (existing) {
    console.log('Admin user already exists:', email);
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create admin user
  const user = usersDb.create({
    id: randomUUID(),
    email,
    displayName: 'Administrator',
    role: 'admin',
    passwordHash
  });

  console.log('\n✅ Admin user created successfully!');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('\n⚠️  Please change this password after your first login!\n');
}

createAdmin().catch(console.error);
