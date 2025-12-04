# PowerShell script to create a package for Sonatype Lifecycle scanning
# This includes all necessary files for npm dependency scanning

$packageName = "startup-valuation"
$version = "1.0.0"
$outputFile = "${packageName}-${version}-for-scanning.zip"
$tempDir = "temp-package"

Write-Host "📦 Creating package for Sonatype Lifecycle scanning..." -ForegroundColor Cyan
Write-Host ""

# Clean up any existing temp directory
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}

# Create temp directory
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Copying files..." -ForegroundColor Yellow

# Copy essential files
$filesToCopy = @(
    "package.json",
    "package-lock.json",
    "index.html",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "eslint.config.js",
    "README.md",
    "SONATYPE_SCANNING.md"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $tempDir
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
}

# Copy directories
$dirsToCopy = @(
    "src",
    "public"
)

foreach ($dir in $dirsToCopy) {
    if (Test-Path $dir) {
        Copy-Item -Recurse $dir -Destination $tempDir
        Write-Host "  ✓ $dir/" -ForegroundColor Green
    }
}

# Create ZIP file
Write-Host ""
Write-Host "Creating ZIP archive..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $outputFile -Force

# Clean up temp directory
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "✅ Package created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Package: $outputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Contents:" -ForegroundColor Cyan
Write-Host "   - package.json (dependency manifest)" -ForegroundColor White
Write-Host "   - package-lock.json (locked dependencies)" -ForegroundColor White
Write-Host "   - All source code (src/)" -ForegroundColor White
Write-Host "   - Public assets (public/)" -ForegroundColor White
Write-Host "   - Configuration files" -ForegroundColor White
Write-Host ""
Write-Host "🔍 For Sonatype Lifecycle:" -ForegroundColor Cyan
Write-Host "   1. Upload $outputFile to Sonatype Lifecycle" -ForegroundColor White
Write-Host "   2. Select 'npm' or 'Node.js' as application type" -ForegroundColor White
Write-Host "   3. Sonatype will automatically detect and scan dependencies" -ForegroundColor White
Write-Host ""
Write-Host "💡 Alternative: Point Sonatype Lifecycle directly to this directory" -ForegroundColor Yellow
Write-Host "   (No packaging needed - it will read package.json and package-lock.json)" -ForegroundColor Yellow


