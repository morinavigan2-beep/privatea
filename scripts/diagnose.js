import { readdirSync, statSync, existsSync, unlinkSync, rmSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
console.log("CWD:", root);

// Check if node_modules exists and what type it is
const nmPath = join(root, 'node_modules');
if (existsSync(nmPath)) {
  const stat = statSync(nmPath);
  console.log("node_modules exists:", {
    isFile: stat.isFile(),
    isDirectory: stat.isDirectory(),
    isSymlink: stat.isSymbolicLink(),
    size: stat.size,
  });
  
  if (stat.isFile()) {
    console.log("FOUND: node_modules is a FILE, not a directory! Removing it...");
    unlinkSync(nmPath);
    console.log("Removed node_modules file.");
  }
} else {
  console.log("node_modules does not exist at", nmPath);
}

// List all top-level entries
const entries = readdirSync(root);
console.log("\nTop-level entries count:", entries.length);
console.log("Entries:", entries.filter(e => e.startsWith('node') || e.startsWith('pnpm') || e.startsWith('.git') || e.startsWith('.npm')));
