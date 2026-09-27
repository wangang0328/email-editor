/**
 * 从中台按需拉取已发布 bundle，写入 Lingui PO（+ json 镜像），再 compile。
 *
 * 入参以本地 zh-Hans catalog key 为准（msgid + 可选 msgctxt）：
 * 优先传 sourceHash；无 map 时传 keys（msgid）与 items({key,context})；
 * **一次 POST 传入全部目标 langs**，响应 byLang 分语言写回（写 PO 时恢复 msgctxt）。
 *
 *   pnpm i18n:pull-published                         # 默认 zh-Hans，mode=full
 *   pnpm i18n:pull-published -- --lang en
 *   pnpm i18n:pull-published -- --all
 *   pnpm i18n:pull-published -- --mode delta
 *   pnpm i18n:pull-published -- --legacy-ns          # 旧：按语言多次 GET namespaces
 *   pnpm i18n:pull-published -- --replace
 *   pnpm i18n:pull-published -- --skip-compile
 *   pnpm i18n:pull-published -- --dry-run
 */
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {
  apiRequest,
  CATALOG_CONTEXT_SEP,
  CANONICAL_TO_LOCAL,
  getConfig,
  LOCAL_TO_CANONICAL,
  LOCALES_DIR,
  LocaleMap,
  escapePo,
  formatCatalogKey,
  loadCurrentKeys,
  loadKeyMap,
  markPulledHashes,
  mergeKeyHashes,
  parseArgs,
  parseCatalogKey,
  parsePoFile,
  planPullIds,
  poFilePath,
  readJsonLocale,
  writeJsonLocale,
} from './shared';

const CHUNK = 400;

interface LangBundle {
  lang: string;
  langAlias?: string;
  version?: string;
  entries: LocaleMap;
  entryCount?: number;
  missingPublished?: number;
}

interface BundlePullData {
  langs?: string[];
  langErrors?: string[];
  keyHashes?: Record<string, string>;
  byLang?: Record<string, LangBundle>;
  /** 单语言兼容字段 */
  lang?: string;
  entries?: LocaleMap;
  version?: string;
  diagnostics?: {
    matchedSources?: number;
    entryCount?: number;
    missingKeysTotal?: number;
    missingHashesTotal?: number;
    hint?: string;
  };
}

interface LegacyBundleData {
  project: string;
  lang: string;
  version?: string;
  entries: LocaleMap;
  diagnostics?: { hint?: string };
}

function poPath(localLang: string) {
  return poFilePath(localLang);
}

function readPoHeader(file: string): string {
  const fallback = `msgid ""
msgstr ""
"Language: ${path.basename(path.dirname(file))}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
`;
  if (!fs.existsSync(file)) return fallback;
  const text = fs.readFileSync(file, 'utf8');
  const first = text.split(/\n\n+/)[0];
  if (first.includes('msgid ""')) return first.trimEnd() + '\n';
  return fallback;
}

function writePo(localLang: string, messages: LocaleMap) {
  const file = poPath(localLang);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const header = readPoHeader(file);
  const keys = Object.keys(messages).sort();
  const body = keys
    .map((k) => {
      const msgstr = escapePo(messages[k] ?? '');
      if (k.includes(CATALOG_CONTEXT_SEP)) {
        const { key: msgid, context } = parseCatalogKey(k);
        return `msgctxt "${escapePo(context)}"\nmsgid "${escapePo(msgid)}"\nmsgstr "${msgstr}"\n`;
      }
      return `msgid "${escapePo(k)}"\nmsgstr "${msgstr}"\n`;
    })
    .join('\n');
  fs.writeFileSync(file, `${header}\n${body}`, 'utf8');
}

function runCompile() {
  console.log('[i18n:pull-published] lingui compile ...');
  const result = spawnSync('pnpm', ['exec', 'lingui', 'compile'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    throw new Error('lingui compile failed');
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function fillChineseFallback(
  keys: string[],
  existing?: LocaleMap,
): LocaleMap {
  const out: LocaleMap = { ...(existing || {}) };
  for (const k of keys) {
    if (out[k] == null || out[k] === '') {
      // 占位用中文 msgid，不把 msgctxt 拼进文案
      out[k] = parseCatalogKey(k).key;
    }
  }
  return out;
}

/**
 * 远端可能仍按纯 msgid 回 entries；本地有 context 时映射回 catalog key，便于写 msgctxt。
 */
function remapRemoteToCatalogKeys(
  remote: LocaleMap,
  catalogKeys: string[],
): LocaleMap {
  const byMsgid = new Map<string, string[]>();
  for (const ck of catalogKeys) {
    const { key: msgid } = parseCatalogKey(ck);
    const list = byMsgid.get(msgid) || [];
    list.push(ck);
    byMsgid.set(msgid, list);
  }
  const out: LocaleMap = {};
  for (const [k, v] of Object.entries(remote)) {
    if (k.includes(CATALOG_CONTEXT_SEP)) {
      out[k] = v;
      continue;
    }
    const cks = byMsgid.get(k);
    if (!cks?.length) {
      out[k] = v;
    } else if (cks.length === 1) {
      out[cks[0]] = v;
    } else {
      // 同 msgid 多 context：仅在远端已是 catalog key 时才精确；否则先落到无 context 项
      const plain = cks.find((ck) => !ck.includes(CATALOG_CONTEXT_SEP));
      if (plain) out[plain] = v;
      else for (const ck of cks) out[ck] = v;
    }
  }
  return out;
}

/** 把 keyHashes 的纯 msgid 键尽量对齐到本地 catalog key */
function remapKeyHashes(
  keyHashes: Record<string, string>,
  catalogKeys: string[],
): Record<string, string> {
  const out: Record<string, string> = { ...keyHashes };
  for (const ck of catalogKeys) {
    if (out[ck]) continue;
    const { key: msgid, context } = parseCatalogKey(ck);
    if (!context && keyHashes[msgid]) out[ck] = keyHashes[msgid];
    // 有 context 时期望服务端已用 formatCatalogKey 回写；若只有 msgid 则无法唯一映射
    const formatted = formatCatalogKey(msgid, context);
    if (context && keyHashes[formatted]) out[ck] = keyHashes[formatted];
  }
  return out;
}

function applyLangWrite(
  localLang: string,
  remote: LocaleMap,
  options: {
    merge: boolean;
    dryRun: boolean;
    jsonOnly: boolean;
    skipJson: boolean;
  },
) {
  let nextPo: LocaleMap = remote;
  if (options.merge && !options.jsonOnly) {
    const localPo = parsePoFile(poPath(localLang));
    nextPo = { ...localPo, ...remote };
  }

  let nextJson: LocaleMap = remote;
  if (options.merge) {
    const localJson = readJsonLocale(localLang);
    nextJson = { ...localJson, ...remote };
  }

  if (options.dryRun) {
    return {
      remoteKeys: Object.keys(remote).length,
      poKeys: Object.keys(nextPo).length,
      jsonKeys: Object.keys(nextJson).length,
    };
  }

  if (!options.jsonOnly) writePo(localLang, nextPo);
  if (!options.skipJson) writeJsonLocale(localLang, nextJson);

  return {
    remoteKeys: Object.keys(remote).length,
    poKeys: Object.keys(nextPo).length,
    jsonKeys: Object.keys(nextJson).length,
  };
}

/**
 * 一次（或按 key/hash/item 分片）请求，langs 全部带上。
 * 返回 byLang（canonical → bundle）+ keyHashes。
 */
async function fetchMultiLangBundle(options: {
  localLangs: string[];
  mode: 'full' | 'delta';
  hashes: string[];
  keys: string[];
  items: Array<{ key: string; context: string }>;
}): Promise<BundlePullData> {
  const cfg = getConfig();
  type Piece = {
    hashes?: string[];
    keys?: string[];
    items?: Array<{ key: string; context: string }>;
  };
  const pieces: Piece[] = [
    ...chunk(options.hashes, CHUNK).map((hashes) => ({ hashes })),
    ...chunk(options.keys, CHUNK).map((keys) => ({ keys })),
    ...chunk(options.items, CHUNK).map((items) => ({ items })),
  ];

  const byLang: Record<string, LangBundle> = {};
  const keyHashes: Record<string, string> = {};
  let matchedSources = 0;
  let missingKeysTotal = 0;
  let missingHashesTotal = 0;
  let hint: string | undefined;
  const langErrors: string[] = [];

  if (!pieces.length) {
    return { byLang: {}, keyHashes: {}, diagnostics: { matchedSources: 0 } };
  }

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    const pct = Math.round(((i + 1) / pieces.length) * 100);
    console.log(
      `[i18n:pull-published] 请求中… ${i + 1}/${pieces.length} (${pct}%)  languages=${options.localLangs.join(',')}  hashes=${piece.hashes?.length || 0}  keys=${piece.keys?.length || 0}  items=${piece.items?.length || 0}`,
    );
    const data = await apiRequest<BundlePullData>('POST', '/i18n/client/bundle', {
      langs: options.localLangs,
      project: cfg.project,
      namespace: cfg.namespace,
      hashes: piece.hashes,
      keys: piece.keys,
      items: piece.items,
      mode: options.mode,
      env: 'dev',
      clientVersion: cfg.clientVersion || undefined,
    });

    Object.assign(keyHashes, data.keyHashes || {});
    matchedSources = Math.max(
      matchedSources,
      data.diagnostics?.matchedSources || 0,
    );
    missingKeysTotal += data.diagnostics?.missingKeysTotal || 0;
    missingHashesTotal += data.diagnostics?.missingHashesTotal || 0;
    hint = data.diagnostics?.hint || hint;
    if (data.langErrors?.length) langErrors.push(...data.langErrors);

    const chunkByLang = data.byLang || {};
    // 兼容：只有 entries 没有 byLang
    if (!Object.keys(chunkByLang).length && data.entries && data.lang) {
      chunkByLang[data.lang] = {
        lang: data.lang,
        entries: data.entries,
        version: data.version,
      };
    }

    for (const [canonical, bundle] of Object.entries(chunkByLang)) {
      if (!byLang[canonical]) {
        byLang[canonical] = {
          lang: canonical,
          langAlias: bundle.langAlias,
          version: bundle.version,
          entries: { ...(bundle.entries || {}) },
          entryCount: 0,
          missingPublished: bundle.missingPublished || 0,
        };
      } else {
        Object.assign(byLang[canonical].entries, bundle.entries || {});
        byLang[canonical].version = bundle.version || byLang[canonical].version;
        byLang[canonical].missingPublished =
          (byLang[canonical].missingPublished || 0) +
          (bundle.missingPublished || 0);
      }
      byLang[canonical].entryCount = Object.keys(byLang[canonical].entries).length;
    }
  }

  return {
    byLang,
    keyHashes,
    langErrors: langErrors.length ? [...new Set(langErrors)] : undefined,
    diagnostics: {
      matchedSources,
      missingKeysTotal,
      missingHashesTotal,
      hint,
    },
  };
}

function resolveLocalLang(canonical: string, requestedLocal: string[]): string | null {
  const alias = CANONICAL_TO_LOCAL[canonical];
  if (alias && requestedLocal.includes(alias)) return alias;
  if (requestedLocal.includes(canonical)) return canonical;
  // 请求的是别名，响应用规范码
  for (const local of requestedLocal) {
    if (LOCAL_TO_CANONICAL[local] === canonical) return local;
  }
  return alias || null;
}

async function pullLegacyPerLang(
  localLangs: string[],
  options: {
    merge: boolean;
    dryRun: boolean;
    jsonOnly: boolean;
    skipJson: boolean;
  },
) {
  const cfg = getConfig();
  const results: Array<{
    lang: string;
    skipped: boolean;
    remoteKeys: number;
    poKeys: number;
    jsonKeys: number;
    error?: string;
  }> = [];

  for (const localLang of localLangs) {
    try {
      console.log(`[i18n:pull-published] GET legacy lang=${localLang}`);
      const data = await apiRequest<LegacyBundleData>(
        'GET',
        '/i18n/client/bundle',
        undefined,
        {
          project: cfg.project,
          lang: localLang,
          namespaces: cfg.namespace || undefined,
          env: 'dev',
          clientVersion: cfg.clientVersion || undefined,
        },
      );
      const remote = data.entries || {};
      if (!Object.keys(remote).length) {
        results.push({
          lang: localLang,
          skipped: true,
          remoteKeys: 0,
          poKeys: 0,
          jsonKeys: 0,
          error: data.diagnostics?.hint || 'empty',
        });
        continue;
      }
      const written = applyLangWrite(localLang, remote, options);
      results.push({ lang: localLang, skipped: false, ...written });
    } catch (e: any) {
      results.push({
        lang: localLang,
        skipped: true,
        remoteKeys: 0,
        poKeys: 0,
        jsonKeys: 0,
        error: e?.message || String(e),
      });
    }
  }
  return results;
}

async function main() {
  const { flags } = parseArgs(process.argv.slice(2));
  const cfg = getConfig();
  const dryRun = Boolean(flags['dry-run']);
  const merge = !flags.replace;
  const all = Boolean(flags.all);
  const jsonOnly = Boolean(flags['json-only']);
  const skipJson = Boolean(flags['skip-json']);
  const skipCompile = Boolean(flags['skip-compile']) || dryRun || jsonOnly;
  const legacyNs = Boolean(flags['legacy-ns']);
  const mode: 'full' | 'delta' =
    flags.mode === 'delta' || flags.incremental || flags.delta
      ? 'delta'
      : 'full';
  const oneLang =
    typeof flags.lang === 'string' ? flags.lang : all ? null : 'zh-Hans';

  const langs = all
    ? Object.keys(LOCAL_TO_CANONICAL).filter(
        (f) =>
          fs.existsSync(poPath(f)) ||
          fs.existsSync(path.join(LOCALES_DIR, `${f}.json`)),
      )
    : [oneLang!];

  const localKeys = loadCurrentKeys();
  const writeOpts = { merge, dryRun, jsonOnly, skipJson };

  console.log(
    `[i18n:pull-published] ${cfg.apiBase} ns=${cfg.namespace} mode=${legacyNs ? 'legacy-ns' : mode} merge=${merge} localKeys=${localKeys.length} langs=${langs.length}`,
  );
  console.log(`[i18n:pull-published] queue: ${langs.join(', ')}`);

  const tAll = Date.now();
  type PullResult = {
    lang: string;
    skipped: boolean;
    dryRun?: boolean;
    remoteKeys: number;
    poKeys: number;
    jsonKeys: number;
    filledChinese?: number;
    source: 'remote' | 'zh-fallback' | 'mixed' | 'skip';
    error?: string;
  };
  const results: PullResult[] = [];

  if (legacyNs) {
    const legacyResults = await pullLegacyPerLang(langs, writeOpts);
    results.push(
      ...legacyResults.map((r) => ({
        ...r,
        source: r.skipped ? ('skip' as const) : ('remote' as const),
      })),
    );
  } else {
    const hashSet = new Set<string>();
    const keySet = new Set<string>();
    const itemMap = new Map<string, { key: string; context: string }>();
    const keysNeededByLang = new Map<string, Set<string>>();
    let skippedAsPulledTotal = 0;

    console.log(`[i18n:pull-published] ——— 1/3 规划 ———`);
    for (const localLang of langs) {
      const fromPo = parsePoFile(poFilePath(localLang));
      const localEntries = Object.keys(fromPo).length
        ? fromPo
        : readJsonLocale(localLang);
      const plan = planPullIds({
        keys: localKeys,
        mode,
        localLang,
        namespace: cfg.namespace,
        localEntries,
      });
      skippedAsPulledTotal += plan.skippedAsPulled;
      const needKeys = new Set<string>(plan.neededCatalogKeys);
      for (const h of plan.hashes) hashSet.add(h);
      for (const k of plan.keys) keySet.add(k);
      for (const it of plan.items) {
        itemMap.set(formatCatalogKey(it.key, it.context), it);
      }
      if (mode === 'full') {
        for (const k of localKeys) needKeys.add(k);
      } else {
        const keyToHash = loadKeyMap().keyToHash;
        const hashToKey = new Map(
          Object.entries(keyToHash).map(([k, h]) => [h, k]),
        );
        for (const h of plan.hashes) {
          const k = hashToKey.get(h);
          if (k) needKeys.add(k);
        }
      }
      keysNeededByLang.set(localLang, needKeys);
    }
    const itemList = [...itemMap.values()];
    console.log(
      `[i18n:pull-published] 目标语言 ${langs.length} 个: ${langs.join(', ')}`,
    );
    console.log(
      `[i18n:pull-published] 待拉词条 hashes=${hashSet.size} keys=${keySet.size} items=${itemList.length} 增量已跳过≈${skippedAsPulledTotal}`,
    );

    if (!hashSet.size && !keySet.size && !itemList.length) {
      console.log('[i18n:pull-published] 无待拉词条（增量已全部覆盖）');
      for (const lang of langs) {
        results.push({
          lang,
          skipped: true,
          remoteKeys: 0,
          poKeys: 0,
          jsonKeys: 0,
          source: 'skip',
        });
      }
    } else {
      try {
        console.log(`[i18n:pull-published] ——— 2/3 拉取 ———`);
        const data = await fetchMultiLangBundle({
          localLangs: langs,
          mode,
          hashes: [...hashSet],
          keys: [...keySet],
          items: itemList,
        });

        const byLang = data.byLang || {};
        const remoteCanonicals = Object.keys(byLang);
        const remoteLocals = remoteCanonicals
          .map((c) => resolveLocalLang(c, langs) || CANONICAL_TO_LOCAL[c] || c)
          .filter(Boolean);
        const matchedSources = data.diagnostics?.matchedSources || 0;

        console.log(
          `[i18n:pull-published] 远端返回语言 ${remoteCanonicals.length} 个: ${remoteLocals.join(', ') || '(无)'}`,
        );
        console.log(
          `[i18n:pull-published] 匹配 online 源词条 ${matchedSources} 条（中文 key 数）`,
        );
        if (data.langErrors?.length) {
          console.warn(`[i18n:pull-published] 语言告警: ${data.langErrors.join('；')}`);
        }
        if (data.diagnostics?.missingKeysTotal || data.diagnostics?.missingHashesTotal) {
          console.warn(
            `[i18n:pull-published] 未匹配 keys=${data.diagnostics.missingKeysTotal || 0} hashes=${data.diagnostics.missingHashesTotal || 0}`,
          );
        }

        const remappedHashes = data.keyHashes
          ? remapKeyHashes(data.keyHashes, localKeys)
          : undefined;
        if (remappedHashes && Object.keys(remappedHashes).length) {
          mergeKeyHashes(remappedHashes, cfg.namespace);
          console.log(
            `[i18n:pull-published] 已更新 key-map +${Object.keys(remappedHashes).length}`,
          );
        }

        console.log(`[i18n:pull-published] ——— 3/3 写入 ———`);
        const missingLangs: string[] = [];

        for (const localLang of langs) {
          const canonical = LOCAL_TO_CANONICAL[localLang] || localLang;
          const need = keysNeededByLang.get(localLang) || new Set(localKeys);
          const needList = [...need];
          const bundle =
            byLang[canonical] ||
            Object.entries(byLang).find(
              ([code]) => resolveLocalLang(code, [localLang]) === localLang,
            )?.[1];

          let remote = bundle?.entries
            ? remapRemoteToCatalogKeys({ ...bundle.entries }, needList)
            : {};
          if (mode === 'delta' && need.size) {
            const filtered: LocaleMap = {};
            for (const [k, v] of Object.entries(remote)) {
              if (need.has(k) || need.has(parseCatalogKey(k).key)) {
                filtered[k] = v;
              }
            }
            remote = filtered;
          }

          const remoteHit = Object.keys(remote).filter(
            (k) => remote[k] != null && remote[k] !== '',
          ).length;
          const langMissing =
            !bundle || remoteHit === 0 || (data.langErrors || []).some(
              (e) => e.includes(canonical) || e.includes(localLang),
            );

          let filledChinese = 0;
          let source: PullResult['source'] = 'remote';

          if (langMissing) {
            missingLangs.push(localLang);
            // 整语缺失：全部用中文 msgid 补齐
            const before = Object.keys(remote).length;
            remote = fillChineseFallback(needList, remote);
            filledChinese = Object.keys(remote).length - before;
            // 若原本几乎全空，算整语 fallback
            source = remoteHit === 0 ? 'zh-fallback' : 'mixed';
            console.log(
              `[i18n:pull-published] ✗ ${localLang} 缺失/为空 → 用中文补齐 ${needList.length} 条`,
            );
          } else {
            // 语种有数据：缺口 key 仍用中文补
            const beforeKeys = new Set(
              Object.keys(remote).filter((k) => remote[k]),
            );
            remote = fillChineseFallback(needList, remote);
            filledChinese = needList.filter((k) => !beforeKeys.has(k)).length;
            source = filledChinese > 0 ? 'mixed' : 'remote';
            console.log(
              `[i18n:pull-published] ✓ ${localLang} ← ${bundle!.lang} 远端=${remoteHit}` +
                (filledChinese ? ` 中文补齐=${filledChinese}` : '') +
                ` version=${bundle!.version || '-'}`,
            );
          }

          const written = applyLangWrite(localLang, remote, writeOpts);
          results.push({
            lang: localLang,
            skipped: false,
            dryRun: dryRun || undefined,
            filledChinese,
            source,
            ...written,
          });

          if (!dryRun && remappedHashes) {
            const hashes: string[] = [];
            for (const k of Object.keys(remote)) {
              if (remappedHashes[k]) hashes.push(remappedHashes[k]);
              else {
                const msgid = parseCatalogKey(k).key;
                if (remappedHashes[msgid]) hashes.push(remappedHashes[msgid]);
              }
            }
            if (hashes.length) markPulledHashes(localLang, hashes);
          }
        }

        if (missingLangs.length) {
          console.warn(
            `[i18n:pull-published] 缺失语言（已中文补齐）: ${missingLangs.join(', ')}`,
          );
        }
      } catch (e: any) {
        const msg = e?.message || String(e);
        console.error(`[i18n:pull-published] 拉取失败: ${msg}`);
        // 失败时仍为各语言写中文兜底，避免本地空白
        console.log(`[i18n:pull-published] 失败兜底：各语言用中文 msgid 补齐`);
        for (const localLang of langs) {
          const need =
            keysNeededByLang.get(localLang) || new Set(localKeys);
          const remote = fillChineseFallback([...need]);
          const written = applyLangWrite(localLang, remote, writeOpts);
          results.push({
            lang: localLang,
            skipped: false,
            filledChinese: Object.keys(remote).length,
            source: 'zh-fallback',
            error: msg,
            ...written,
          });
        }
      }
    }
  }

  const pureRemote = results.filter((r) => r.source === 'remote');
  const mixed = results.filter((r) => r.source === 'mixed');
  const totalRemoteEntries = results.reduce((s, r) => s + r.remoteKeys, 0);
  const totalFilled = results.reduce((s, r) => s + (r.filledChinese || 0), 0);

  console.log('');
  console.log('[i18n:pull-published] ——— 汇总 ———');
  console.log(
    `[i18n:pull-published] 拉取到语言 (${pureRemote.length + mixed.length}): ${[...pureRemote, ...mixed].map((r) => r.lang).join(', ') || '(无)'}`,
  );
  console.log(
    `[i18n:pull-published] 缺失/中文补齐语言 (${results.filter((r) => r.source === 'zh-fallback').length}): ${results.filter((r) => r.source === 'zh-fallback').map((r) => r.lang).join(', ') || '(无)'}`,
  );
  console.log(
    `[i18n:pull-published] 词条合计: 远端写入 ${totalRemoteEntries}，其中中文补齐 ${totalFilled}；本地 msgid ${localKeys.length}`,
  );
  for (const r of results) {
    const tag =
      r.source === 'zh-fallback'
        ? 'fallback-zh'
        : r.source === 'mixed'
          ? 'mixed'
          : r.skipped
            ? 'skip'
            : 'ok';
    const extra = r.filledChinese ? ` zhFill=${r.filledChinese}` : '';
    const err = r.error ? ` err=${r.error}` : '';
    console.log(
      `[i18n:pull-published]   ${r.lang.padEnd(10)} ${tag.padEnd(12)} entries=${r.remoteKeys} po=${r.poKeys}${extra}${err}`,
    );
  }
  console.log(
    `[i18n:pull-published] 完成 ${results.length}/${langs.length} 语言，耗时 ${Date.now() - tAll}ms`,
  );

  if (!skipCompile) {
    console.log('');
    runCompile();
    console.log('[i18n:pull-published] compile done');
  } else if (!dryRun && !jsonOnly) {
    console.log('[i18n:pull-published] skipped compile（可用 pnpm i18n:compile）');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
