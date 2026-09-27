/**
 * 词条 Diff：默认先拉远端当前引用，再与本地 **zh-Hans PO msgid** 对比
 *
 *   pnpm i18n:diff-refs
 *   pnpm i18n:diff-refs -- --json
 *   pnpm i18n:diff-refs -- --baseline=local
 *   pnpm i18n:diff-refs -- --baseline=remote
 */
import {
  BaselineMode,
  getConfig,
  parseArgs,
  printDiff,
  resolveDiff,
} from './shared';

function baselineMode(flags: Record<string, string | boolean>): BaselineMode {
  const raw = flags.baseline;
  if (raw === 'local' || raw === 'remote' || raw === 'auto') return raw;
  if (flags.local) return 'local';
  if (flags.remote) return 'remote';
  return 'auto';
}

async function main() {
  const { flags } = parseArgs(process.argv.slice(2));
  const cfg = getConfig();
  const mode = baselineMode(flags);

  console.log(
    `[i18n:diff-refs] project=${cfg.project} namespace=${cfg.namespace} baseline=${mode}`,
  );

  const diff = await resolveDiff({ mode });

  if (flags.json) {
    console.log(
      JSON.stringify(
        {
          project: cfg.project,
          namespace: cfg.namespace,
          baselineMode: mode,
          ...diff,
        },
        null,
        2,
      ),
    );
    return;
  }

  printDiff(diff);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
