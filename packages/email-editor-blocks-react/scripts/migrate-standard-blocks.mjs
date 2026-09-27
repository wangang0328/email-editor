// One-off: split blocks/standard/{Name}/index.tsx into plugins/standard/{name}/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, '../src');
const blocksRoot = path.join(srcRoot, 'blocks/standard');
const pluginsRoot = path.join(srcRoot, 'plugins/standard');

const SKIP = new Set(['button']); // already migrated

function toKebab(name) {
  return name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

function extractBalancedBrace(content, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error('Unbalanced braces');
}

function migrateFolder(folderName) {
  const kebab = toKebab(folderName);
  if (SKIP.has(kebab)) return { folderName, status: 'skipped' };

  const srcFile = path.join(blocksRoot, folderName, 'index.tsx');
  if (!fs.existsSync(srcFile)) {
    return { folderName, status: 'missing' };
  }

  const content = fs.readFileSync(srcFile, 'utf8');
  const constMatch = content.match(/export const (\w+)\s*(?::[^=]+)?=\s*createBlock/);
  if (!constMatch) throw new Error(`${folderName}: no export const createBlock`);
  const blockExport = constMatch[1];

  const typeMatch = content.match(/export type (I\w+)\s*=/);
  if (!typeMatch) throw new Error(`${folderName}: no export type`);
  const typeName = typeMatch[1];

  const typeStart = content.indexOf(`export type ${typeName}`);
  const exportConstIdx = content.indexOf(`export const ${blockExport}`);
  const typeDef = content.slice(typeStart, exportConstIdx).trim();

  const createBlockMatch = content.match(
    new RegExp(
      `export const ${blockExport}[^=]*=\\s*createBlock(?:<[^>]+>)?\\s*\\(\\{`,
    ),
  );
  if (!createBlockMatch) throw new Error(`${folderName}: createBlock config not found`);
  const defOpen = createBlockMatch.index + createBlockMatch[0].length - 1;

  const renderMatch = content.match(/\n\s*render\s*\(/);
  if (!renderMatch) throw new Error(`${folderName}: no render(`);
  const renderIdx = content.indexOf(renderMatch[0], defOpen);
  const definitionInner = content.slice(defOpen + 1, renderIdx).trim().replace(/,\s*$/, '');

  const renderBodyStart = content.indexOf('{', renderIdx);
  const renderBodyEnd = extractBalancedBrace(content, renderBodyStart);
  const renderFn = content.slice(renderIdx, renderBodyEnd + 1).trim().replace(/,\s*$/, '');

  const renderName = `${blockExport.charAt(0).toLowerCase() + blockExport.slice(1)}Render`;
  const definitionName = `${blockExport.charAt(0).toLowerCase() + blockExport.slice(1)}Definition`;

  // schema imports
  const schemaImports = new Set([
    `import { t } from '@lingui/core/macro';`,
    `import { BasicType } from '@wa-dev/email-editor-shared/types';`,
    `import type { IBlockData } from '@blocks/typings';`,
    `import type { BlockDefinition } from '@blocks/plugins/types';`,
  ]);

  let schemaBody = definitionInner;
  if (schemaBody.includes('mergeBlock(')) {
    schemaImports.add(`import { mergeBlock } from '@wa-dev/email-editor-shared';`);
  } else if (schemaBody.includes('merge(')) {
    schemaImports.add(`import { merge } from 'lodash-es';`);
  }
  if (schemaBody.includes('getImg(')) {
    schemaImports.add(`import { getImg } from '@blocks/utils/getImg';`);
  }
  if (typeDef.includes('CSSProperties')) {
    schemaImports.add(`import type { CSSProperties } from 'react';`);
  }

  for (const dep of ['Wrapper', 'AccordionElement', 'AccordionTitle', 'AccordionText']) {
    if (schemaBody.includes(`${dep}.`)) {
      schemaImports.add(
        `import { ${dep} } from '@blocks/plugins/standard/${toKebab(dep)}';`,
      );
    }
  }

  const schemaTs = `${[...schemaImports].join('\n')}

${typeDef.replace('IBlockData', 'IBlockData')}

export const ${definitionName}: BlockDefinition<${typeName}> = {
${schemaBody}
};
`;

  // renderer imports
  const rendererImports = new Set([`import React from 'react';`]);
  const renderBody = renderFn.replace(
    /^render\s*\(([^)]*)\)\s*\{/,
    `export const ${renderName}: IBlock<${typeName}>['render'] = ($1) => {`,
  );

  if (renderBody.includes('BasicBlock')) {
    rendererImports.add(`import { BasicBlock } from '@blocks/mjml/BasicBlock';`);
  }
  if (renderBody.includes('BlockRenderer')) {
    rendererImports.add(`import { BlockRenderer } from '@blocks/mjml/BlockRenderer';`);
  }
  if (renderBody.includes('getAdapterAttributesString')) {
    rendererImports.add(`import { getAdapterAttributesString } from '@blocks/utils/getAdapterAttributesString';`);
  }
  if (renderBody.includes('generaMjmlMetaData')) {
    rendererImports.add(`import { generaMjmlMetaData } from '@blocks/utils/generaMjmlMetaData';`);
  }
  if (renderBody.includes('getChildIdx') || renderBody.includes('getPageIdx')) {
    rendererImports.add(`import { getChildIdx, getPageIdx } from '@wa-dev/email-editor-shared';`);
  } else if (renderBody.includes('getChildIdx')) {
    rendererImports.add(`import { getChildIdx } from '@wa-dev/email-editor-shared';`);
  }

  rendererImports.add(`import type { IBlock } from '@blocks/typings';`);
  rendererImports.add(`import type { ${typeName} } from './schema';`);

  const rendererTsx = `${[...rendererImports].join('\n')}

${renderBody};
`;

  const indexTs = `import { defineBlock } from '@blocks/plugins/defineBlock';
import type { ${typeName} } from './schema';
import { ${definitionName} } from './schema';
import { ${renderName} } from './renderer';

export type { ${typeName} } from './schema';
export { ${definitionName} } from './schema';

export const ${blockExport} = defineBlock<${typeName}>(${definitionName}, ${renderName});
`;

  const outDir = path.join(pluginsRoot, kebab);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'schema.ts'), schemaTs);
  fs.writeFileSync(path.join(outDir, 'renderer.tsx'), rendererTsx);
  fs.writeFileSync(path.join(outDir, 'index.ts'), indexTs);

  return { folderName, kebab, status: 'ok' };
}

const folders = fs
  .readdirSync(blocksRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const results = [];
for (const folder of folders) {
  try {
    results.push(migrateFolder(folder));
  } catch (e) {
    results.push({ folder, status: 'error', error: e.message });
  }
}

console.log(JSON.stringify(results, null, 2));
