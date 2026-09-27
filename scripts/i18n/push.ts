/**
 * 推送词条到中台 draft（POST /i18n/client/sync）
 *
 * 默认只推 zh-CN，且默认增量（only-added）。
 *
 *   pnpm i18n:push-draft
 *   pnpm i18n:push-draft -- --full            # 全量推中文（慎用）
 *   pnpm i18n:push-draft -- --all-langs
 *   pnpm i18n:push-draft -- --publish
 *   pnpm i18n:push-draft -- --dry-run
 *   pnpm i18n:push-draft -- --no-skip
 */
import {
  LOCAL_TO_CANONICAL,
  apiRequest,
  buildTranslationEntries,
  getConfig,
  parseArgs,
  resolveDiff,
} from './shared';

async function main() {
  const { flags } = parseArgs(process.argv.slice(2));
  const cfg = getConfig();
  const dryRun = Boolean(flags['dry-run']);
  const forceFull = Boolean(flags.full);
  const publish = Boolean(flags.publish);
  const skipIfTranslated = !flags['no-skip'];
  const allLangs = Boolean(flags['all-langs']);
  const langs = allLangs
    ? Object.values(LOCAL_TO_CANONICAL)
    : ['zh-CN'];

  let keys: string[] | undefined;
  if (!forceFull) {
    const diff = await resolveDiff({ mode: 'auto' });
    keys = diff.isFirstSync ? diff.current : diff.added;
    if (keys.length === 0) {
      console.log(
        '[i18n:push-draft] 无新增 key，跳过（服务端对已存在且中文未变的也会 skip）',
      );
      return;
    }
    console.log(
      `[i18n:push-draft] only-added → ${keys.length} keys (baseline=${diff.baselineSource}${diff.isFirstSync ? ', first sync' : ''})`,
    );
  } else {
    console.log('[i18n:push-draft] full push（全量中文）');
  }

  const entries = buildTranslationEntries(keys, { langs });
  console.log(
    `[i18n:push-draft] ${cfg.apiBase} project=${cfg.project} entries=${entries.length} langs=${langs.join(',')} publish=${publish} skipIfTranslated=${skipIfTranslated}`,
  );

  if (dryRun) {
    console.log('[dry-run] sample entry:', JSON.stringify(entries[0], null, 2));
    console.log(`[dry-run] total entries=${entries.length}`);
    return;
  }

  const BATCH = 80;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < entries.length; i += BATCH) {
    const chunk = entries.slice(i, i + BATCH);
    const result = await apiRequest<{
      created?: number;
      updated?: number;
      skipped?: number;
      errors?: string[];
    }>('POST', '/i18n/client/sync', {
      project: cfg.project,
      namespace: cfg.namespace,
      sourceLang: 'zh-CN',
      publish,
      skipIfTranslated,
      pusher: cfg.pusher,
      entries: chunk,
    });
    created += result.created || 0;
    updated += result.updated || 0;
    skipped += result.skipped || 0;
    if (result.errors?.length) errors.push(...result.errors);
    console.log(
      `[i18n:push-draft] batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(entries.length / BATCH)} created=${result.created || 0} updated=${result.updated || 0} skipped=${result.skipped || 0}`,
    );
  }

  console.log(
    `[i18n:push-draft] done created=${created} updated=${updated} skipped=${skipped} errors=${errors.length}`,
  );
  if (errors.length) {
    errors.slice(0, 20).forEach((e) => console.error('  !', e));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
