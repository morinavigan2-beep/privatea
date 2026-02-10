import { execSync } from 'child_process';

try {
  execSync('git commit --allow-empty -m "Empty commit"', { stdio: 'inherit' });
  console.log('Empty commit created successfully');
} catch (error) {
  console.error('Failed to create empty commit:', error.message);
  process.exit(1);
}
