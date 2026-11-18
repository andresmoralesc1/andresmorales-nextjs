#!/usr/bin/env node
// scripts/admin-reset.cjs
// Sets or resets the admin username & password for andresmorales-nextjs

const fs = require('node:fs');
const path = require('node:path');
const { scryptSync, randomBytes } = require('node:crypto');

const username = process.argv[2] || 'andres';
const password = process.argv[3];

if (!password) {
  console.error('Usage: node scripts/admin-reset.cjs <username> <password>');
  console.error('   or: node scripts/admin-reset.cjs <password> (defaults to user "andres")');
  process.exit(1);
}

const finalUser = process.argv[3] ? process.argv[2] : 'andres';
const finalPass = process.argv[3] ? process.argv[3] : process.argv[2];

const salt = randomBytes(16);
const derived = scryptSync(finalPass, salt, 64);
const passwordHash = `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;

const adminRecord = {
  username: finalUser,
  passwordHash,
  createdAt: new Date().toISOString(),
};

const adminPath = path.join(__dirname, '..', 'data', 'admin.json');
fs.writeFileSync(adminPath, JSON.stringify(adminRecord, null, 2) + '\n', 'utf-8');
console.log(`Admin credentials saved to ${adminPath} for user: "${finalUser}"`);
