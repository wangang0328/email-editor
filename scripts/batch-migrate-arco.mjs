import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Components that have adapter implementations
const migratedComponents = [
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
  'Layout',
  'Card',
  'ConfigProvider',
  'Typography',
  'InputNumber',
  'Spin',
  'List',
  'TreeSelect',
  'Form',
  'AutoComplete',
];

// Icons mapping from Arco to Lucide
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
  'IconLink': 'Link',
  'IconUnlink': 'Unlink',
  'IconBold': 'Bold',
  'IconItalic': 'Italic',
  'IconUnderline': 'Underline',
  'IconStrikethrough': 'Strikethrough',
  'IconAlignLeft': 'AlignLeft',
  'IconAlignCenter': 'AlignCenter',
  'IconAlignRight': 'AlignRight',
  'IconOrderedList': 'ListOrdered',
  'IconUnorderedList': 'List',
  'IconIndent': 'IndentIncrease',
  'IconOutdent': 'IndentDecrease',
  'IconQuote': 'Quote',
  'IconCode': 'Code',
  'IconImage': 'Image',
  'IconFont': 'Type',
  'IconHighlight': 'Highlighter',
  'IconUndo': 'Undo',
  'IconRedo': 'Redo',
  'IconFullscreen': 'Maximize',
  'IconSave': 'Save',
  'IconExport': 'Download',
  'IconImport': 'Upload',
  'IconFolderAdd': 'FolderPlus',
  'IconFile': 'File',
  'IconFolder': 'Folder',
  'IconDrag': 'GripVertical',
  'IconMenu': 'Menu',
  'IconHome': 'Home',
  'IconArrowLeft': 'ArrowLeft',
  'IconArrowRight': 'ArrowRight',
  'IconArrowUp': 'ArrowUp',
  'IconArrowDown': 'ArrowDown',
  'IconCaretUp': 'ChevronUp',
  'IconCaretDown': 'ChevronDown',
  'IconCaretLeft': 'ChevronLeft',
  'IconCaretRight': 'ChevronRight',
  'IconExpand': 'Expand',
  'IconShrink': 'Shrink',
  'IconZoomIn': 'ZoomIn',
  'IconZoomOut': 'ZoomOut',
  'IconMinus': 'Minus',
  'IconLoading': 'Loader2',
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

  // Check if file has Arco imports
  const hasArcoImport = content.includes("@arco-design/web-react");
  if (!hasArcoImport) {
    return { modified: false, modifications: [] };
  }

  // Extract all Arco component imports
  const arcoImportRegex = /import\s*{([^}]+)}\s*from\s*['"]@arco-design\/web-react['"];?/g;
  const arcoIconImportRegex = /import\s*{([^}]+)}\s*from\s*['"]@arco-design\/web-react\/icon['"];?/g;

  let arcoMatch = arcoImportRegex.exec(content);
  let iconMatch = arcoIconImportRegex.exec(content);

  if (!arcoMatch && !iconMatch) {
    return { modified: false, modifications: [] };
  }

  const componentsToMigrate = [];
  const componentsToKeep = [];
  const iconsToMigrate = [];

  // Parse component imports
  if (arcoMatch) {
    const imports = arcoMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    for (const imp of imports) {
      const name = imp.includes(' as ') ? imp.split(' as ')[0].trim() : imp;
      if (migratedComponents.includes(name)) {
        componentsToMigrate.push(imp);
      } else {
        componentsToKeep.push(imp);
      }
    }
  }

  // Parse icon imports
  if (iconMatch) {
    const imports = iconMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    for (const imp of imports) {
      if (iconMapping[imp]) {
        iconsToMigrate.push(imp);
      }
    }
  }

  // Skip if nothing to migrate
  if (componentsToMigrate.length === 0 && iconsToMigrate.length === 0) {
    return { modified: false, modifications: [] };
  }

  // Build new import statements
  const newImports = [];

  // Add arco-adapter import
  if (componentsToMigrate.length > 0) {
    newImports.push(`import { ${componentsToMigrate.join(', ')} } from '@extensions/components/arco-adapter';`);
    modifications.push(`Migrated ${componentsToMigrate.length} component(s): ${componentsToMigrate.join(', ')}`);
  }

  // Add lucide-react import
  if (iconsToMigrate.length > 0) {
    const lucideIcons = iconsToMigrate.map(i => iconMapping[i]).filter(Boolean);
    const uniqueLucideIcons = [...new Set(lucideIcons)];
    
    // Check if lucide import already exists and merge
    const existingLucideMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"];?/);
    if (existingLucideMatch) {
      const existingIcons = existingLucideMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      const allIcons = [...new Set([...existingIcons, ...uniqueLucideIcons])];
      content = content.replace(
        /import\s*{[^}]+}\s*from\s*['"]lucide-react['"];?/,
        `import { ${allIcons.join(', ')} } from 'lucide-react';`
      );
    } else {
      newImports.push(`import { ${uniqueLucideIcons.join(', ')} } from 'lucide-react';`);
    }
    modifications.push(`Migrated ${iconsToMigrate.length} icon(s)`);

    // Replace icon usage in JSX
    for (const arcoIcon of iconsToMigrate) {
      const lucideIcon = iconMapping[arcoIcon];
      if (lucideIcon) {
        // Replace <IconName /> or <IconName/>
        content = content.replace(
          new RegExp(`<${arcoIcon}\\s*/>`, 'g'),
          `<${lucideIcon} className="h-4 w-4" />`
        );
        // Replace <IconName ...props />
        content = content.replace(
          new RegExp(`<${arcoIcon}(\\s+[^>]*?)/>`, 'g'),
          (match, props) => {
            // Check if className already exists
            if (props.includes('className')) {
              return `<${lucideIcon}${props}/>`;
            }
            return `<${lucideIcon} className="h-4 w-4"${props}/>`;
          }
        );
      }
    }
  }

  // Update Arco imports
  if (componentsToMigrate.length > 0) {
    if (componentsToKeep.length > 0) {
      // Keep remaining imports
      content = content.replace(
        /import\s*{[^}]+}\s*from\s*['"]@arco-design\/web-react['"];?\n?/,
        `import { ${componentsToKeep.join(', ')} } from '@arco-design/web-react';\n`
      );
    } else {
      // Remove entire Arco import
      content = content.replace(
        /import\s*{[^}]+}\s*from\s*['"]@arco-design\/web-react['"];?\n?/,
        ''
      );
    }
  }

  // Remove icon imports
  if (iconsToMigrate.length > 0) {
    content = content.replace(
      /import\s*{[^}]+}\s*from\s*['"]@arco-design\/web-react\/icon['"];?\n?/,
      ''
    );
  }

  // Add new imports at the top (after first import)
  if (newImports.length > 0) {
    const firstImportMatch = content.match(/^import\s+/m);
    if (firstImportMatch) {
      const insertPos = content.indexOf(firstImportMatch[0]);
      content = content.slice(0, insertPos) + newImports.join('\n') + '\n' + content.slice(insertPos);
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
}

main().catch(console.error);
