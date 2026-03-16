const fs = require('fs');
const path = require('path');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        getAllFiles(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const srcDir = path.resolve('src');
const allFiles = getAllFiles(srcDir);
const srcFiles = allFiles.filter(f => /\.(js|jsx|css|scss|png|jpg|svg)$/.test(f));

const usedFiles = new Set([
  path.join(srcDir, 'main.jsx'),
  path.join(srcDir, 'index.css'),
  path.join(srcDir, 'App.jsx'),
  path.join(srcDir, 'App.css'),
]);

const importPatterns = [
  /from\s+['"]([^'"]+)['"]/g,
  /import\s+['"]([^'"]+)['"]/g,
  /import\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\(\s*['"]([^'"]+)['"]\s*\)/g
];

allFiles.forEach(filePath => {
  if (!/\.(js|jsx)$/.test(filePath)) return;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const dirname = path.dirname(filePath);

    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const impPath = match[1];
        if (impPath.startsWith('.')) {
          const absPath = path.normalize(path.join(dirname, impPath));
          
          // Check extensions
          ['', '.js', '.jsx', '.css', '.png', '.svg', '.jpg'].forEach(ext => {
            const fullPath = absPath + ext;
            if (fs.existsSync(fullPath)) {
              if (fs.statSync(fullPath).isFile()) {
                usedFiles.add(fullPath);
              } else if (fs.statSync(fullPath).isDirectory()) {
                ['/index.js', '/index.jsx'].forEach(idxExt => {
                  const idxPath = path.join(fullPath, idxExt);
                  if (fs.existsSync(idxPath)) usedFiles.add(idxPath);
                });
              }
            }
          });
        }
      }
    });
  } catch (e) {}
});

console.log("UNUSED FILES:");
srcFiles.forEach(f => {
  if (!usedFiles.has(f)) {
    console.log(f);
  }
});
