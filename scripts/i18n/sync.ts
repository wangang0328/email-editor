/**
 * 一条龙：收集词条 → diff → 上报引用 → 只推中文词条（默认 draft，不上线）
 *
 *   pnpm i18n:upload-draft
 *   pnpm i18n:upload-draft -- --dry-run
 *   pnpm i18n:upload-draft -- --skip-extract     # collect 时跳过 lingui extract
 *   pnpm i18n:upload-draft -- --skip-push        # 只收集+diff+ref-sync
 *   pnpm i18n:upload-draft -- --full-push        # 推全量中文（默认 only-added）
 *   pnpm i18n:upload-draft -- --all-langs
 *   pnpm i18n:upload-draft -- --publish          # 慎用：跳过校准直接上线
 *   pnpm i18n:upload-draft -- --with-pull        # push 后再 pull（仅已 online 的会有内容）
 *   pnpm i18n:upload-draft -- --with-pull --all  # pull 全部语言
 */
import { spawnSync } from 'child_process';
import * as path from 'path';
import { parseArgs } from './shared';

function run(script: string, extraArgs: string[]) {
  const tsNode = path.join(
    process.cwd(),
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'ts-node.cmd' : 'ts-node',
  );
  const result = spawnSync(
    tsNode,
    ['--project', path.join(process.cwd(), 'scripts', 'tsconfig.json'), script, ...extraArgs],
    {
      stdio: 'inherit',
      cwd: process.cwd(),
      shell: process.platform === 'win32',
    },
  );
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

async function main() {
  const { flags } = parseArgs(process.argv.slice(2));
  const dry = flags['dry-run'] ? ['--dry-run'] : [];
  const dir = path.join(process.cwd(), 'scripts', 'i18n');
  const withPull = Boolean(flags['with-pull']);
  const totalSteps = withPull ? 5 : 4;

  console.log(`=== 1/${totalSteps} collect（提取词条 → locales） ===`);
  const collectArgs: string[] = [];
  if (flags['skip-extract']) collectArgs.push('--skip-extract');
  run(path.join(dir, 'collect.ts'), collectArgs);

  console.log(`\n=== 2/${totalSteps} diff ===`);
  run(path.join(dir, 'ref-diff.ts'), []);

  console.log(`\n=== 3/${totalSteps} ref-sync ===`);
  const refArgs = [...dry];
  if (flags.full) refArgs.push('--full');
  run(path.join(dir, 'ref-sync.ts'), refArgs);

  if (flags['skip-push']) {
    console.log('\n[i18n:upload-draft] --skip-push，跳过推送');
  } else {
    console.log(`\n=== 4/${totalSteps} push（默认仅 zh-CN + only-added + draft） ===`);
    const pushArgs = [...dry];
    if (flags['full-push']) pushArgs.push('--full');
    if (flags['all-langs']) pushArgs.push('--all-langs');
    if (flags.publish) pushArgs.push('--publish');
    if (flags['no-skip']) pushArgs.push('--no-skip');
    run(path.join(dir, 'push.ts'), pushArgs);
  }

  if (withPull) {
    console.log(`\n=== ${totalSteps}/${totalSteps} pull（仅 online 已发布） ===`);
    const pullArgs = [...dry];
    if (flags.all) pullArgs.push('--all');
    if (typeof flags.lang === 'string') {
      pullArgs.push('--lang', flags.lang);
    }
    if (flags.mode === 'delta' || flags.incremental) {
      pullArgs.push('--mode', 'delta');
    } else if (typeof flags.mode === 'string') {
      pullArgs.push('--mode', flags.mode);
    }
    if (flags['skip-compile']) pullArgs.push('--skip-compile');
    run(path.join(dir, 'pull.ts'), pullArgs);
  }

  console.log('\n[i18n:upload-draft] 完成：collect → diff → ref-sync → push(zh-CN draft)');
  if (!flags.publish) {
    console.log(
      '[i18n:upload-draft] 提示：默认不上线，便于中台校准/审核；通过并上线后执行：pnpm i18n:pull-published -- --all',
    );
  }
  if (withPull) {
    console.log(
      '[i18n:upload-draft] 已附带 pull：仅能拉到此前已 publish 的译文；刚 push 的 draft 不会出现在 bundle 里',
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
