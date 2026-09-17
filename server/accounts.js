import 'dotenv/config';
import { openDatabase, migrate } from './db.js';
import { emailSchema, token, hash } from './security.js';
const [command, rawEmail] = process.argv.slice(2);
if (!['invite','reset'].includes(command) || !rawEmail) throw new Error('Usage: npm run account -- invite|reset user@example.com');
const email = emailSchema.parse(rawEmail);
const db = await openDatabase();
try {
  await migrate(db);
  const exists = (await db.all('SELECT id FROM users WHERE email = ?', [email])).length;
  if (command === 'invite' && exists) throw new Error('Account already exists; use reset instead.');
  if (command === 'reset' && !exists) throw new Error('Account not found.');
  const value = token();
  await db.transaction(async tx => {
    await tx.run('DELETE FROM tokens WHERE email = ? AND kind = ?', [email, command]);
    await tx.run('INSERT INTO tokens (token_hash, kind, email, expires_at) VALUES (?, ?, ?, ?)', [hash(value), command, email, Date.now() + (command === 'invite' ? 48 * 60 : 30) * 60 * 1000]);
  });
  const origin = new URL(process.env.APP_ORIGIN || 'http://localhost:5173').origin;
  console.log(command === 'invite' ? `${origin}/register?invite=${value}&email=${encodeURIComponent(email)}` : `${origin}/reset-password?token=${value}`);
  console.log('Share this private, single-use link only with the account owner.');
} finally { await db.close(); }
