# Sonatype Lifecycle Scanning Guide

This document explains how to scan this React/Vite application with Sonatype Lifecycle for vulnerability detection.

## Overview

**Important**: This is a **Node.js/npm project**, not a Java project. Sonatype Lifecycle supports npm projects directly - you don't need a JAR file.

## What Sonatype Lifecycle Needs

Sonatype Lifecycle scans npm projects by analyzing:
- `package.json` - Lists all dependencies
- `package-lock.json` - Locks exact dependency versions and transitive dependencies
- Source code (optional, for deeper analysis)

## Methods to Scan

### Method 1: Direct Directory Scan (Recommended)
Point Sonatype Lifecycle directly to this project directory:
- Sonatype Lifecycle will automatically detect it as an npm project
- It will read `package.json` and `package-lock.json`
- No packaging needed!

### Method 2: NPM Package Tarball
Create a distributable package:

```bash
npm run package
```

This creates: `startup-valuation-1.0.0.tgz`

Upload this `.tgz` file to Sonatype Lifecycle.

### Method 3: ZIP Archive
Create a ZIP file with the source code:

**On Windows (PowerShell):**
```powershell
Compress-Archive -Path package.json,package-lock.json,src,public,index.html,vite.config.ts,tsconfig*.json -DestinationPath startup-valuation-for-scanning.zip
```

**On Linux/Mac:**
```bash
zip -r startup-valuation-for-scanning.zip package.json package-lock.json src/ public/ index.html vite.config.ts tsconfig*.json
```

## What Gets Scanned

Sonatype Lifecycle will scan:
- ✅ All dependencies in `package.json`
- ✅ All transitive dependencies (from `package-lock.json`)
- ✅ Direct dependencies: react, react-dom, docx
- ✅ Dev dependencies: vite, typescript, eslint, etc.

## Configuration

The project is already configured with:
- ✅ `package.json` with proper version (1.0.0)
- ✅ `package-lock.json` with locked dependencies
- ✅ All source files in `src/`

## Sonatype Lifecycle Setup

1. **Create Application in Sonatype Lifecycle**
   - Application Type: **npm** or **Node.js**
   - Point to this directory or upload the package

2. **Scan Configuration**
   - Sonatype will automatically detect npm format
   - It will read `package.json` and `package-lock.json`
   - No additional configuration needed

3. **Run Scan**
   - Sonatype will analyze all dependencies
   - Check for known vulnerabilities (CVEs)
   - Check license compliance
   - Generate reports

## Files Included in Package

- `package.json` - Dependency manifest
- `package-lock.json` - Locked dependency tree
- `src/` - Source code
- `public/` - Public assets
- `vite.config.ts` - Build configuration
- `tsconfig*.json` - TypeScript configuration

## Files Excluded

- `node_modules/` - Not needed (dependencies are resolved from package files)
- `dist/` - Build output (not needed for scanning)
- `.git/` - Version control (not needed)
- `*.log` - Log files

## Troubleshooting

**Q: Can I create a JAR file?**
A: No, JAR files are Java-specific. This is a Node.js project. Use npm package (`.tgz`) or ZIP.

**Q: Do I need node_modules?**
A: No, Sonatype Lifecycle reads dependency information from `package.json` and `package-lock.json`.

**Q: What if package-lock.json is missing?**
A: Run `npm install` to generate it, or Sonatype may generate it during scan.

## Additional Resources

- [Sonatype Lifecycle npm Support](https://help.sonatype.com/iqserver/managing/applications-and-application-evaluations/application-management/scanning-applications#ScanningApplications-npm)
- [npm pack Documentation](https://docs.npmjs.com/cli/v8/commands/npm-pack)


