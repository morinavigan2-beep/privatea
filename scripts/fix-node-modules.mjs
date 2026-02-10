import { existsSync, statSync, unlinkSync, rmSync } from 'fs';
import { resolve } from 'path';

const projectRoot = resolve(process.cwd());
const nodeModulesPath = resolve(projectRoot, 'node_modules');

console.log('[v0] Project root:', projectRoot);
console.log('[v0] Checking node_modules at:', nodeModulesPath);

if (existsSync(nodeModulesPath)) {
  const stat = statSync(nodeModulesPath);
  if (stat.isFile()) {
    console.log('[v0] node_modules is a FILE (not a directory) - this is the problem!');
    unlinkSync(nodeModulesPath);
    console.log('[v0] Removed node_modules file');
  } else if (stat.isDirectory()) {
    console.log('[v0] node_modules is a directory - removing it to do a clean install');
    rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log('[v0] Removed node_modules directory');
  } else if (stat.isSymbolicLink()) {
    console.log('[v0] node_modules is a symlink - removing it');
    unlinkSync(nodeModulesPath);
    console.log('[v0] Removed node_modules symlink');
  }
} else {
  console.log('[v0] node_modules does not exist - nothing to fix');
}

// Also check if pnpm-lock.yaml exists
const lockPath = resolve(projectRoot, 'pnpm-lock.yaml');
if (existsSync(lockPath)) {
  console.log('[v0] pnpm-lock.yaml exists');
} else {
  console.log('[v0] pnpm-lock.yaml does NOT exist');
}

console.log('[v0] Done! node_modules path should now be clear for pnpm install.');
