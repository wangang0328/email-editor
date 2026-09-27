import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Type mappings from Arco to our adapter
const typeMapping = {
  'PopoverProps': 'PopoverProps',
  'TooltipProps': 'TooltipProps',
  'InputProps': 'InputProps',
  'SelectProps': 'SelectProps',
  'RadioGroupProps': 'RadioGroupProps',
  'CheckboxGroupProps': 'CheckboxGroupProps',
  'TabsProps': 'TabsProps',
  'SliderProps': 'SliderProps',
  'SwitchProps': 'SwitchProps',
  'TextAreaProps': 'TextAreaProps',
  'TreeSelectProps': 'TreeSelectProps',
  'InputNumberProps': 'InputNumberProps',
  'FormItemProps': 'FormItemProps',
  'AutoCompleteProps': 'AutoCompleteProps',
};

function getAllFiles(dir, extensions, files = []) {
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', 'lib', 'arco-adapter', 'ui'].includes(item.name)) {
        getAllFiles(fullPath, extensions, files);
      }
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let modifications = [];

  // Check for Arco type imports only (not component imports)
  const arcoTypeImportRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@arco-design\/web-react['"];?/g;
  
  let match;
  while ((match = arcoTypeImportRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(s => s.trim()).filter(Boolean);
    
    // Check if all imports are types (Props suffix or 'as' keyword indicating type alias)
    const typeImports = imports.filter(imp => {
      const name = imp.includes(' as ') ? imp.split(' as ')[0].trim() : imp;
      return name.endsWith('Props') || Object.keys(typeMapping).includes(name);
    });
    
    const nonTypeImports = imports.filter(imp => {
      const name = imp.includes(' as ') ? imp.split(' as ')[0].trim() : imp;
      return !name.endsWith('Props') && !Object.keys(typeMapping).includes(name);
    });

    if (typeImports.length > 0 && nonTypeImports.length === 0) {
      // All imports are types, replace with adapter import
      const adapterImport = `import type { ${typeImports.join(', ')} } from '@extensions/components/arco-adapter';`;
      content = content.replace(match[0], adapterImport);
      modifications.push(`Migrated ${typeImports.length} type(s): ${typeImports.join(', ')}`);
    } else if (typeImports.length > 0 && nonTypeImports.length > 0) {
      // Mixed imports, need to split
      const typeImportLine = `import type { ${typeImports.join(', ')} } from '@extensions/components/arco-adapter';`;
      const componentImportLine = `import { ${nonTypeImports.join(', ')} } from '@arco-design/web-react';`;
      content = content.replace(match[0], typeImportLine + '\n' + componentImportLine);
      modifications.push(`Split imports: ${typeImports.length} type(s), ${nonTypeImports.length} component(s)`);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { modified: true, modifications };
  }

  return { modified: false, modifications: [] };
}

async function main() {
  const srcDir = path.join(__dirname, '../packages/email-editor-extensions/src');
  
  const files = getAllFiles(srcDir, ['.tsx', '.ts']);
  
  console.log(`Found ${files.length} files to check\n`);
  
  let modifiedCount = 0;
  
  for (const file of files) {
    const { modified, modifications } = migrateFile(file);
    if (modified) {
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      console.log(`✓ ${relativePath}`);
      modifications.forEach(m => console.log(`  - ${m}`));
      modifiedCount++;
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Modified ${modifiedCount} files`);
}

main().catch(console.error);
