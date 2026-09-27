/**
 * 上报引用清单（默认先拉远端 refs 再 diff → POST /i18n/client/ref-sync）
 *
 *   pnpm i18n:report-refs
 *   pnpm i18n:report-refs -- --full
 *   pnpm i18n:report-refs -- --dry-run
 *   pnpm i18n:report-refs -- --no-create
 *   pnpm i18n:report-refs -- --baseline=local
 */
import {
  apiRequest,
  BaselineMode,
  getConfig,
  parseArgs,
  printDiff,
  resolveDiff,
  saveSnapshot,
  splitCatalogKeysForApi,
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
  const forceFull = Boolean(flags.full);
  const dryRun = Boolean(flags['dry-run']);
  const autoCreate = !flags['no-create'];
  const mode = baselineMode(flags);

  const diff = await resolveDiff({ mode });
  const syncMode = forceFull || diff.isFirstSync ? 'full' : 'diff';

  console.log(
    `[i18n:report-refs] ${cfg.apiBase} project=${cfg.project} syncMode=${syncMode} baseline=${diff.baselineSource}`,
  );
  printDiff(diff);

  // keys = 无 context 的 msgid（兼容旧 API）；items = 有 context 的 {key, context}
  const currentSplit = splitCatalogKeysForApi(diff.current);
  const addedSplit = splitCatalogKeysForApi(diff.added);
  const removedSplit = splitCatalogKeysForApi(diff.removed);

  const body =
    syncMode === 'full'
      ? {
          project: cfg.project,
          namespace: cfg.namespace,
          mode: 'full' as const,
          keys: currentSplit.keys,
          items: currentSplit.items.length ? currentSplit.items : undefined,
          unchangedCount: 0,
          pusher: cfg.pusher,
          clientVersion: cfg.clientVersion || undefined,
          autoCreateEntries: autoCreate,
        }
      : {
          project: cfg.project,
          namespace: cfg.namespace,
          mode: 'diff' as const,
          added: addedSplit.keys,
          removed: [
            ...removedSplit.keys,
            // 有 context 的减少项：msgid 仍进 removed 做兼容；精确项走 items
            ...removedSplit.items.map((i) => i.key),
          ].filter((v, i, a) => a.indexOf(v) === i),
          items: [...addedSplit.items, ...removedSplit.items].length
            ? [...addedSplit.items, ...removedSplit.items]
            : undefined,
          unchangedCount: diff.unchanged.length,
          pusher: cfg.pusher,
          clientVersion: cfg.clientVersion || undefined,
          autoCreateEntries: autoCreate,
        };

  if (dryRun) {
    console.log('\n[dry-run] payload preview:');
    console.log(
      JSON.stringify(
        {
          ...body,
          keys:
            syncMode === 'full'
              ? `[${currentSplit.keys.length} keys + ${currentSplit.items.length} items]`
              : undefined,
          added: syncMode === 'diff' ? body.added : undefined,
          items: body.items
            ? `[${body.items.length} items with context]`
            : undefined,
        },
        null,
        2,
      ),
    );
    return;
  }

  const result = await apiRequest<Record<string, unknown>>(
    'POST',
    '/i18n/client/ref-sync',
    body,
  );
  console.log('[i18n:report-refs] ok', JSON.stringify(result, null, 2));

  saveSnapshot({
    project: cfg.project,
    namespace: cfg.namespace,
    syncedAt: new Date().toISOString(),
    keys: diff.current,
  });
  console.log('[i18n:report-refs] snapshot updated .i18n-ref-snapshot.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
