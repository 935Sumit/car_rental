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
const allJSFiles = getAllFiles(srcDir).filter(f => /\.(js|jsx)$/.test(f));

allJSFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const filename = path.relative(process.cwd(), file);
  console.log(`\n--- ANALYZING: ${filename} ---`);

  // 1. Unused Imports
  const importLines = content.match(/^import\s+.*from\s+['"].*['"];?$/gm) || [];
  importLines.forEach(line => {
    // Basic extraction of names
    let names = [];
    if (line.includes('{')) {
      const match = line.match(/\{([^}]+)\}/);
      if (match) names = match[1].split(',').map(n => n.trim().split(' as ')[0]);
    } else {
      const match = line.match(/import\s+([^{]+)\s+from/);
      if (match) names = [match[1].trim()];
    }

    names.forEach(name => {
      if (name === '*') return;
      // Count occurrences of name as a whole word, excluding the import line
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      const matches = content.match(regex) || [];
      if (matches.length <= 1) {
        console.log(`[!] Unused Import: "${name}"`);
      }
    });
  });

  // 2. Unused Variables (const/let)
  const varDecls = content.match(/\b(const|let)\s+([a-zA-Z0-9_$]+)\s*=/g) || [];
  varDecls.forEach(decl => {
    const name = decl.split(/\s+/)[1];
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    const matches = content.match(regex) || [];
    if (matches.length <= 1) {
      console.log(`[!] Unused Variable: "${name}"`);
    }
  });

  // 3. Unused Functions
  const funcDecls = content.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/g) || [];
  funcDecls.forEach(decl => {
    const name = decl.match(/function\s+([a-zA-Z0-9_$]+)/)[1];
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    const matches = content.match(regex) || [];
    if (matches.length <= 1) {
      console.log(`[!] Unused Function: "${name}"`);
    }
  });

  // 4. Unused State (useState)
  const stateDecls = content.match(/const\s+\[\s*([a-zA-Z0-9_$]+)\s*,\s*([a-zA-Z0-9_$]+)\s*\]\s*=\s*useState/g) || [];
  stateDecls.forEach(decl => {
    const match = decl.match(/const\s+\[\s*([a-zA-Z0-9_$]+)\s*,\s*([a-zA-Z0-9_$]+)\s*\]/);
    if (match) {
      const stateName = match[1];
      const setterName = match[2];
      
      const stateRegex = new RegExp(`\\b${stateName}\\b`, 'g');
      const stateMatches = content.match(stateRegex) || [];
      if (stateMatches.length <= 1) {
        console.log(`[!] Unused State: "${stateName}" (Defined but never read)`);
      }
      
      const setterRegex = new RegExp(`\\b${setterName}\\b`, 'g');
      const setterMatches = content.match(setterRegex) || [];
      if (setterMatches.length <= 1) {
        console.log(`[!] Unused Setter: "${setterName}" (Defined but never used)`);
      }
    }
  });
});
