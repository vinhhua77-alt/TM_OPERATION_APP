// Quick script to hash password
import bcrypt from 'bcryptjs';

const password = '123456';
const hash = await bcrypt.hash(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nRun this SQL in Supabase SQL Editor:');
console.log(`UPDATE staff_master SET password_hash = '${hash}' WHERE staff_id = 'TM0001';`);
