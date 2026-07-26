#!/usr/bin/env node

/**
 * Source Overlay Studio - Automated Setup
 * This script installs dependencies and starts the application
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const backendDir = path.join(root, 'backend');
const frontendDir = path.join(root, 'frontend');

console.log('\n╔════════════════════════════════════════════╗');
console.log('║  Source Overlay Studio - Setup & Start    ║');
console.log('╚════════════════════════════════════════════╝\n');

function runCommand(command, args, cwd, displayName) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 ${displayName}...\n`);
    const proc = spawn(command, args, { cwd, stdio: 'inherit', shell: true });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n❌ ${displayName} failed with exit code ${code}`);
        reject(new Error(`${displayName} failed`));
      } else {
        console.log(`\n✓ ${displayName} completed\n`);
        resolve();
      }
    });
    
    proc.on('error', (err) => {
      console.error(`\n❌ ${displayName} error:`, err.message);
      reject(err);
    });
  });
}

async function setup() {
  try {
    // Install backend
    await runCommand('npm', ['install'], backendDir, 'Installing backend dependencies');
    
    // Install frontend
    await runCommand('npm', ['install'], frontendDir, 'Installing frontend dependencies');
    
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  ✓ Setup Complete!                         ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    console.log('📋 To start the application, run:\n');
    console.log('   npm run start\n');
    console.log('Or in separate terminals:\n');
    console.log('   Terminal 1: cd backend && npm run dev');
    console.log('   Terminal 2: cd frontend && npm run dev\n');
    console.log('🌐 Frontend: http://localhost:4500');
    console.log('⚙️  Backend:  http://localhost:4501\n');
    
  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    process.exit(1);
  }
}

setup();
