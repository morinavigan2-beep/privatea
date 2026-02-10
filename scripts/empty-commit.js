import { execSync } from 'child_process';
import { resolve } from 'path';

const projectRoot = resolve('/vercel/share/v0-project');

try {
  execSync('git commit --allow-empty -m "Empty commit"', { 
    cwd: projectRoot,
    stdio: 'inherit' 
  });
  console.log('Empty commit created successfully');
} catch (error) {
  console.error('Failed to create empty commit:', error.message);
  process.exit(1);
}
