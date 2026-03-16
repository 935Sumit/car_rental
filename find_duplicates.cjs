const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

const allFiles = getAllFiles(path.resolve('src'));
const hashes = {};
const duplicates = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file);
  const hash = crypto.createHash('md5').update(content).digest('hex');
  if (hashes[hash]) {
    duplicates.push([hashes[hash], file]);
  } else {
    hashes[hash] = file;
  }
});

console.log("DUPLICATE FILES (Identical Content):");
duplicates.forEach(([f1, f2]) => {
  console.log(`- ${f1} <-> ${f2}`);
});
