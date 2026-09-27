import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REPLACEMENTS = [
  ["@extensions/components/arco-adapter", "@extensions/components/ui-adapter"],
  // In case there are relative imports targeting the folder name directly
  ["components/arco-adapter", "components/ui-adapter"],
];

function getAllFiles(dir, exts, files = []) {
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', 'lib'].includes(item.name)) {
        getAllFiles(full, exts, files);
      }
    } else if (exts.some((e) => item.name.endsWith(e))) {
      files.push(full);
    }
  }
  return files;
}

function applyReplacements(content) {
  let next = content;
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  return next;
}

async function main() {
  const targetDir = path.join(__dirname, '../packages/email-editor-extensions/src');
  const files = getAllFiles(targetDir, ['.ts', '.tsx']);

  let modified = 0;
  for (const file of files) {
    const original = fs.readFileSync(file, 'utf-8');
    const updated = applyReplacements(original);
    if (updated !== original) {
      fs.writeFileSync(file, updated, 'utf-8');
      modified++;
      console.log(`✓ ${path.relative(path.join(__dirname, '..'), file)}`);
    }
  }

  console.log(`\nModified ${modified} file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

