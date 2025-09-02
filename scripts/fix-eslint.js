#!/usr/bin/env node

/**
 * Script to fix common ESLint issues automatically
 * This addresses the most frequent issues found in the CI/CD pipeline
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing ESLint issues...');

// Run ESLint with --fix flag to auto-fix issues
try {
  console.log('Running ESLint --fix...');
  execSync('npm run lint:fix', { stdio: 'inherit' });
  console.log('✅ ESLint auto-fix completed');
} catch (error) {
  console.log('⚠️ Some issues require manual fixing');
}

// Run Prettier to fix formatting issues
try {
  console.log('Running Prettier...');
  execSync('npm run format', { stdio: 'inherit' });
  console.log('✅ Prettier formatting completed');
} catch (error) {
  console.log('❌ Prettier failed:', error.message);
}

console.log('🎉 Code quality fixes completed!');
console.log('💡 Run "npm run lint" to check remaining issues');
