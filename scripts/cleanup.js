import { statSync, unlinkSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

const projectRoot = resolve(process.cwd());
const nodeModulesPath = resolve(projectRoot, 'node_modules');

console.log('Project root:', projectRoot);
console.log('Checking node_modules at:', nodeModulesPath);

if (existsSync(nodeModulesPath)) {
  const stat = statSync(nodeModulesPath);
  console.log('node_modules exists!');
  console.log('  isFile:', stat.isFile());
  console.log('  isDirectory:', stat.isDirectory());
  console.log('  isSymbolicLink:', stat.isSymbolicLink());
  console.log('  size:', stat.size);
  
  if (stat.isFile()) {
    console.log('node_modules is a FILE - this is the problem!');
    unlinkSync(nodeModulesPath);
    console.log('Deleted node_modules file.');
  }
} else {
  console.log('node_modules does not exist at this path');
}

// Check if node_modules is tracked by git
try {
  const gitCheck = execSync('git ls-files node_modules', { encoding: 'utf-8', cwd: projectRoot });
  if (gitCheck.trim()) {
    console.log('node_modules IS tracked by git:', gitCheck.trim());
    console.log('Removing from git tracking...');
    execSync('git rm --cached node_modules', { encoding: 'utf-8', cwd: projectRoot });
    console.log('Removed from git tracking.');
  } else {
    console.log('node_modules is NOT tracked by git');
  }
} catch (e) {
  console.log('Git check result:', e.message);
}

// Also check git ls-tree for node_modules
try {
  const treeCheck = execSync('git ls-tree HEAD node_modules', { encoding: 'utf-8', cwd: projectRoot });
  if (treeCheck.trim()) {
    console.log('git ls-tree shows node_modules:', treeCheck.trim());
  } else {
    console.log('git ls-tree: node_modules not in HEAD');
  }
} catch (e) {
  console.log('git ls-tree error:', e.message);
}
