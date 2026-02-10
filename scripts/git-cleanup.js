import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('[v0] Starting git cleanup...');

try {
  // Check if node_modules exists as a file (not directory)
  const nmPath = path.join(process.cwd(), 'node_modules');
  const stat = fs.statSync(nmPath);
  
  if (stat.isFile()) {
    console.log('[v0] node_modules is a FILE, removing it...');
    fs.unlinkSync(nmPath);
    console.log('[v0] Removed node_modules file');
  } else if (stat.isDirectory()) {
    console.log('[v0] node_modules is a directory, skipping');
  }
} catch (e) {
  if (e.code === 'ENOENT') {
    console.log('[v0] node_modules does not exist locally');
  } else {
    console.log('[v0] Error checking node_modules:', e.message);
  }
}

try {
  // Remove node_modules from git index if tracked
  console.log('[v0] Removing node_modules from git index...');
  execSync('git rm --cached -r node_modules 2>/dev/null || true', { stdio: 'pipe' });
  console.log('[v0] Removed from git index');
  
  // Add .gitignore update
  console.log('[v0] Updating git index...');
  execSync('git add .gitignore', { stdio: 'pipe' });
  console.log('[v0] Git index updated');
} catch (e) {
  console.log('[v0] Git command error (expected if node_modules not tracked):', e.message);
}

console.log('[v0] Cleanup complete');
