/**
 * 收集词条：lingui extract（更新 PO）→ 镜像 zh-Hans.json（push 用）
 *
 *   pnpm i18n:collect-keys
 *   pnpm i18n:collect-keys -- --skip-extract
 */
import { spawnSync } from 'child_process';
import {
  ZH_PO_PATH,
  parseArgs,
  parsePoFile,
  readJsonLocale,
  writeJsonLocale,
} from './shared';

function runLinguiExtract() {
  console.log('[i18n:collect-keys] lingui extract ...');
  const result = spawnSync('pnpm', ['exec', 'lingui', 'extract'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    throw new Error('lingui extract failed');
  }
}

function mirrorZhJsonFromPo() {
  const messages = parsePoFile(ZH_PO_PATH);
  const keyList = Object.keys(messages).sort();
  console.log(`[i18n:collect-keys] po keys=${keyList.length}`);

  // 镜像 json：便于 push 读 zh-CN；diff/ref-sync 已直接读 PO
  const zh = { ...readJsonLocale('zh-Hans') };
  let added = 0;
  for (const k of keyList) {
    if (zh[k] == null || zh[k] === '') {
      zh[k] = messages[k] || k;
      added++;
    }
  }
  writeJsonLocale('zh-Hans', zh);
  console.log(
    `[i18n:collect-keys] zh-Hans.json mirrored (+${added}) total=${Object.keys(zh).length}`,
  );
  return keyList;
}

async function main() {
  const { flags } = parseArgs(process.argv.slice(2));
  if (!flags['skip-extract']) {
    runLinguiExtract();
  } else {
    console.log('[i18n:collect-keys] skip extract，使用现有 po');
  }

  const keys = mirrorZhJsonFromPo();
  console.log(`[i18n:collect-keys] done totalKeys=${keys.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
