/**
 * One-time Migration Script for URL Diagnostic Center Admin Auth
 * Hashes plaintext admin passwords in data/admin_auth.json using bcryptjs.
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DATA_DIR = path.join(__dirname, '..', 'data');
const AUTH_FILE = path.join(DATA_DIR, 'admin_auth.json');

const defaultUser = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
const forceUpdate = process.argv.includes('--force');

function migrateAuth() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let authData = {};
  if (fs.existsSync(AUTH_FILE)) {
    try {
      authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    } catch (e) {
      console.warn('⚠️ Existing admin_auth.json unreadable. Resetting to default.');
    }
  }

  const username = defaultUser;
  const rawPassword = forceUpdate ? defaultPass : (authData.password || authData.passwordHash || defaultPass);

  // Check if already bcrypt hashed
  const isBcrypt = !forceUpdate && typeof rawPassword === 'string' && /^\$2[ayb]\$.{56}$/.test(rawPassword);

  if (isBcrypt) {
    console.log(`✅ Admin credentials for [${username}] are already bcrypt hashed.`);
    return;
  }

  console.log(`🔒 Hashing updated admin password for user [${username}]...`);
  const passwordHash = bcrypt.hashSync(defaultPass, 10);

  const updatedData = {
    username: username,
    passwordHash: passwordHash,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(AUTH_FILE, JSON.stringify(updatedData, null, 2), 'utf8');
  console.log(`🎉 Password update completed! Saved bcrypt hashed credentials for [${username}] to: ${AUTH_FILE}`);
}

migrateAuth();
