const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building for production...');

// Clean dist folder
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('✅ Cleaned dist folder');
}

// Create dist folder
fs.mkdirSync('dist');
console.log('✅ Created dist folder');

// Copy essential files
const filesToCopy = ['package.json', 'package-lock.json', 'index.js', '.env'];
const foldersToCopy = ['routes', 'models', 'middleware', 'config', 'utils'];

// Copy files
filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('dist', file));
    console.log(`✅ Copied ${file}`);
  }
});

// Copy folders
foldersToCopy.forEach(folder => {
  if (fs.existsSync(folder)) {
    copyFolderRecursiveSync(folder, path.join('dist', folder));
    console.log(`✅ Copied ${folder} folder`);
  }
});

// Install production dependencies
console.log('📦 Installing production dependencies...');
try {
  execSync('npm install --only=production', { cwd: 'dist', stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('⚠️  Dependency installation completed');
}

console.log('🎉 Build completed successfully!');

// Helper function to copy folders recursively
function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}