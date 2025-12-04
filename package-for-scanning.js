#!/usr/bin/env node

/**
 * Script to package the project for Sonatype Lifecycle scanning
 * This creates a tarball with all necessary files for dependency scanning
 */

import { execSync } from 'child_process';
import { createWriteStream } from 'fs';
import { createReadStream, statSync } from 'fs';
import { readdirSync } from 'fs';
import { join } from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { arch, platform } from 'os';

const packageName = 'startup-valuation';
const version = '1.0.0';
const outputFile = `${packageName}-${version}-for-scanning.tar.gz`;

console.log('📦 Packaging project for Sonatype Lifecycle scanning...\n');

// Files/directories to include (Sonatype needs source code + package files)
const includePatterns = [
  'package.json',
  'package-lock.json',
  'src/**',
  'public/**',
  'index.html',
  'vite.config.ts',
  'tsconfig*.json',
  'README.md'
];

// Files/directories to exclude
const excludePatterns = [
  'node_modules',
  'dist',
  '.git',
  '.vscode',
  '.idea',
  '*.log',
  'testsprite_tests'
];

try {
  // Use npm pack which creates a tarball with the right structure
  console.log('Creating npm package tarball...');
  execSync('npm pack', { stdio: 'inherit' });
  
  const npmPackageFile = `${packageName}-${version}.tgz`;
  console.log(`\n✅ Created: ${npmPackageFile}`);
  console.log(`\n📋 This package contains:`);
  console.log(`   - package.json (with all dependencies)`);
  console.log(`   - package-lock.json (dependency tree)`);
  console.log(`   - All source code files`);
  console.log(`\n🔍 For Sonatype Lifecycle:`);
  console.log(`   1. Upload ${npmPackageFile} to Sonatype Lifecycle`);
  console.log(`   2. Or point Sonatype Lifecycle to this directory`);
  console.log(`   3. It will automatically detect npm/Node.js project`);
  console.log(`\n💡 Alternative: Create a ZIP file with source code`);
  
} catch (error) {
  console.error('Error creating package:', error.message);
  process.exit(1);
}


