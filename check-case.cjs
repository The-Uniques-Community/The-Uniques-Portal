const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full, files);
    } else if (full.endsWith('.jsx') || full.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = walk(path.join(process.cwd(), 'src'));
const fileSet = new Set(allFiles.map(f => f.toLowerCase().replace(/\\/g, '/')));
const actualFiles = new Map(allFiles.map(f => [f.toLowerCase().replace(/\\/g, '/'), f.replace(/\\/g, '/')]));

let errors = 0;
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const imports = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
  for (const imp of imports) {
    const match = imp.match(/from\s+['"]([^'"]+)['"]/)[1];
    if (match.startsWith('.')) {
      const dir = path.dirname(file);
      let targetPath = path.resolve(dir, match).replace(/\\/g, '/');
      
      const exts = ['', '.js', '.jsx', '/index.js', '/index.jsx', '/Index.jsx'];
      for (const ext of exts) {
        if (fileSet.has((targetPath + ext).toLowerCase())) {
          const actualTarget = actualFiles.get((targetPath + ext).toLowerCase());
          const requestedTarget = targetPath + ext;
          const requestedParts = requestedTarget.split('/');
          const actualParts = actualTarget.split('/');
          
          for(let i=0; i<actualParts.length; i++) {
             if (actualParts[i] !== requestedParts[i] && actualParts[i].toLowerCase() === requestedParts[i].toLowerCase()) {
                console.log('Case mismatch in ' + file + ': import "' + match + '" -> expected ' + actualParts[i] + ' but got ' + requestedParts[i]);
                errors++;
             }
          }
          break;
        }
      }
    }
  }
}
if(errors === 0) console.log('No case mismatches found.');
