const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(target);
    else if (entry.name.endsWith('.js')) execFileSync(process.execPath, ['--check', target], { stdio: 'inherit' });
  }
}
visit(path.join(__dirname, '..', 'src'));
console.log('Backend JavaScript syntax check passed.');
