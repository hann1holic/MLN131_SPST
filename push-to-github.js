#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const projectDir = path.join(__dirname);

console.log('🚀 Pushing to GitHub...');
console.log('📁 Project:', projectDir);

try {
  // Check git status
  const status = execSync('git status --short', { cwd: projectDir, encoding: 'utf-8' });
  console.log('\n📋 Changes:', status || 'All committed');

  // Push to GitHub
  console.log('\n⏳ Pushing to origin/main...');
  execSync('git push origin main', {
    cwd: projectDir,
    encoding: 'utf-8',
    stdio: 'inherit'
  });

  console.log('\n✅ Push successful!');
  console.log('🔗 Check your repo: https://github.com/HungDo-19104/MLN131_SPST');
} catch (error) {
  console.error('\n❌ Error:', error.message);

  if (error.message.includes('Permission denied')) {
    console.log('\n💡 Fix: Add Personal Access Token');
    console.log('1. Go to: https://github.com/settings/tokens');
    console.log('2. Generate new token with "repo" scope');
    console.log('3. Run: git config --global credential.helper store');
    console.log('4. Run this script again');
  }

  process.exit(1);
}
