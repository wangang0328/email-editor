import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const arcoComponents = [
  'Button',
  'Tooltip', 
  'Popover',
  'Input',
  'Switch',
  'Select',
  'Collapse',
  'Tabs',
  'Slider',
  'Radio',
  'Checkbox',
  'Grid',
  'Space',
  'Drawer',
  'Modal',
  'Message',
  'Dropdown',
  'Menu',
  'Tree',
  'ConfigProvider',
  'Layout',
  'Card',
  'List',
];

const arcoIcons = [
  'IconPlus',
  'IconDelete',
  'IconClose',
  'IconDown',
  'IconUp',
  'IconLeft',
  'IconRight',
  'IconEdit',
  'IconCopy',
  'IconEye',
  'IconEyeInvisible',
  'IconSearch',
  'IconRefresh',
  'IconSettings',
  'IconMore',
  'IconCheck',
  'IconInfo',
  'IconExclamation',
  'IconQuestion',
];

const iconMapping = {
  'IconPlus': 'Plus',
  'IconDelete': 'Trash2',
  'IconClose': 'X',
  'IconDown': 'ChevronDown',
  'IconUp': 'ChevronUp',
  'IconLeft': 'ChevronLeft',
  'IconRight': 'ChevronRight',
  'IconEdit': 'Pencil',
  'IconCopy': 'Copy',
  'IconEye': 'Eye',
  'IconEyeInvisible': 'EyeOff',
  'IconSearch': 'Search',
  'IconRefresh': 'RefreshCw',
  'IconSettings': 'Settings',
  'IconMore': 'MoreHorizontal',
  'IconCheck': 'Check',
  'IconInfo': 'Info',
  'IconExclamation': 'AlertTriangle',
  'IconQuestion': 'HelpCircle',
};

function getAllFiles(dir, extensions, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== 'dist' && item.name !== 'lib' && item.name !== 'arco-adapter' && item.name !== 'ui') {
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

  // Check for Arco imports
  const hasArcoImport = content.includes("from '@arco-design/web-react'");
  const hasArcoIconImport = content.includes("from '@arco-design/web-react/icon'");

  if (!hasArcoImport && !hasArcoIconImport) {
    return { modified: false, modifications: [] };
  }

  // Extract components from Arco import
  const arcoImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]@arco-design\/web-react['"]/);
  const arcoIconImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]@arco-design\/web-react\/icon['"]/);

  const importedComponents = [];
  const importedIcons = [];
  const otherArcoImports = [];

  if (arcoImportMatch) {
    const imports = arcoImportMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    for (const imp of imports) {
      // Handle "Button as ArcoButton" style imports
      const asMatch = imp.match(/^(\w+)\s+as\s+(\w+)$/);
      const name = asMatch ? asMatch[1] : imp;
      
      if (arcoComponents.includes(name)) {
        importedComponents.push(imp);
      } else {
        otherArcoImports.push(imp);
      }
    }
  }

  if (arcoIconImportMatch) {
    const imports = arcoIconImportMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    for (const imp of imports) {
      if (arcoIcons.includes(imp) || imp.startsWith('Icon')) {
        importedIcons.push(imp);
      }
    }
  }

  // Build new imports
  const newImports = [];
  
  // Add arco-adapter import if we have components to migrate
  if (importedComponents.length > 0) {
    // Map component names
    const adapterImports = importedComponents.map(imp => {
      // Handle aliased imports
      if (imp.includes(' as ')) {
        const [original, alias] = imp.split(' as ').map(s => s.trim());
        return `${original} as ${alias}`;
      }
      return imp;
    });
    newImports.push(`import { ${adapterImports.join(', ')} } from '@extensions/components/arco-adapter';`);
    modifications.push(`Migrated ${importedComponents.length} components to arco-adapter`);
  }

  // Add lucide-react import for icons
  if (importedIcons.length > 0) {
    const lucideIcons = importedIcons
      .map(icon => iconMapping[icon])
      .filter(Boolean);
    
    if (lucideIcons.length > 0) {
      // Check if lucide-react import already exists
      if (!content.includes("from 'lucide-react'")) {
        newImports.push(`import { ${lucideIcons.join(', ')} } from 'lucide-react';`);
      }
      modifications.push(`Migrated ${importedIcons.length} icons to lucide-react`);

      // Replace icon usage in the code
      for (const arcoIcon of importedIcons) {
        const lucideIcon = iconMapping[arcoIcon];
        if (lucideIcon) {
          // Replace <IconPlus /> with <Plus className="h-4 w-4" />
          const iconRegex = new RegExp(`<${arcoIcon}\\s*/>`, 'g');
          content = content.replace(iconRegex, `<${lucideIcon} className="h-4 w-4" />`);
          
          // Replace <IconPlus {...props} /> style
          const iconWithPropsRegex = new RegExp(`<${arcoIcon}(\\s[^>]*)/>`, 'g');
          content = content.replace(iconWithPropsRegex, `<${lucideIcon}$1/>`);
        }
      }
    }
  }

  // Remove old Arco imports and add new ones
  if (importedComponents.length > 0 || importedIcons.length > 0) {
    // Remove old arco-design import if all components are migrated
    if (otherArcoImports.length === 0) {
      content = content.replace(/import\s*{[^}]+}\s*from\s*['"]@arco-design\/web-react['"];?\n?/g, '');
    } else {
      // Keep only non-migrated imports
      const newArcoImport = `import { ${otherArcoImports.join(', ')} } from '@arco-design/web-react';`;
      content = content.replace(/import\s*{[^}]+}\s*from\s*['"]@arco-design\/web-react['"];?/, newArcoImport);
    }

    // Remove old icon import
    if (importedIcons.length > 0) {
      content = content.replace(/import\s*{[^}]+}\s*from\s*['"]@arco-design\/web-react\/icon['"];?\n?/g, '');
    }

    // Add new imports after the first import statement
    if (newImports.length > 0) {
      const firstImportMatch = content.match(/^import\s/m);
      if (firstImportMatch) {
        const insertPos = content.indexOf(firstImportMatch[0]);
        content = content.slice(0, insertPos) + newImports.join('\n') + '\n' + content.slice(insertPos);
      }
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
  const modifiedFiles = [];
  
  for (const file of files) {
    const { modified, modifications } = migrateFile(file);
    if (modified) {
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      console.log(`✓ ${relativePath}`);
      modifications.forEach(m => console.log(`  - ${m}`));
      modifiedCount++;
      modifiedFiles.push(relativePath);
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Modified ${modifiedCount} files`);
  
  if (modifiedFiles.length > 0) {
    console.log('\nModified files:');
    modifiedFiles.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(console.error);
