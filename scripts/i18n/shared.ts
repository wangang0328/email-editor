/**
 * 多语言中台同步 — 共享配置与工具
 * 词条 key = 中文原文 = Lingui msgid（lingui/zh-Hans/messages.po）
 * 一词多义：msgctxt 不拼进 msgid；catalog 扁平键 = context + \\u0004 + msgid
 */
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

/** gettext / Lingui：msgctxt 与 msgid 的扁平拼接符（与中台一致） */
export const CATALOG_CONTEXT_SEP = '\u0004';

export function normalizeContext(context?: string | null): string {
  return (context || '').trim();
}

/**
 * 业务词条 ID（与中台 entryIdForKey 一致）。
 * - 无 context：`md5(namespace::key)`
 * - 有 context：`md5(namespace::context::key)`
 */
export function entryIdForKey(
  namespace: string,
  key: string,
  context?: string | null,
): string {
  const ctx = normalizeContext(context);
  const payload = ctx
    ? `${namespace}::${ctx}::${key}`
    : `${namespace}::${key}`;
  return crypto.createHash('md5').update(payload).digest('hex').substring(0, 16);
}

/** 历史管理端 create：md5(中文) */
export function legacyEntryIdFromText(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex').substring(0, 16);
}

/** 新建用 primary；无 context 时附带 legacy 兼容旧数据 */
export function entryIdCandidates(
  namespace: string,
  key: string,
  context?: string | null,
): string[] {
  const primary = entryIdForKey(namespace, key, context);
  const out = [primary];
  if (!normalizeContext(context)) {
    const legacy = legacyEntryIdFromText(key);
    if (legacy !== primary) out.push(legacy);
  }
  return out;
}

/** 扁平 catalog key（PO/json / keyHashes）；有 context 时用 \\u0004 拼接 */
export function formatCatalogKey(
  key: string,
  context?: string | null,
): string {
  const ctx = normalizeContext(context);
  return ctx ? `${ctx}${CATALOG_CONTEXT_SEP}${key}` : key;
}

export function parseCatalogKey(catalogKey: string): {
  key: string;
  context: string;
} {
  const i = catalogKey.indexOf(CATALOG_CONTEXT_SEP);
  if (i < 0) return { key: catalogKey, context: '' };
  return {
    context: catalogKey.slice(0, i),
    key: catalogKey.slice(i + CATALOG_CONTEXT_SEP.length),
  };
}

/** 将 catalog keys 拆成：无 context → keys；有 context → items（供 API） */
export function splitCatalogKeysForApi(catalogKeys: string[]): {
  keys: string[];
  items: Array<{ key: string; context: string }>;
} {
  const keys: string[] = [];
  const items: Array<{ key: string; context: string }> = [];
  for (const ck of catalogKeys) {
    const { key, context } = parseCatalogKey(ck);
    if (context) items.push({ key, context });
    else keys.push(key);
  }
  return {
    keys: [...new Set(keys)],
    items: dedupeItems(items),
  };
}

function dedupeItems(
  items: Array<{ key: string; context: string }>,
): Array<{ key: string; context: string }> {
  const seen = new Set<string>();
  const out: Array<{ key: string; context: string }> = [];
  for (const it of items) {
    const id = formatCatalogKey(it.key, it.context);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(it);
  }
  return out;
}

export const LOCALES_DIR = path.join(
  process.cwd(),
  'packages/email-editor-localization/locales',
);

export const LINGUI_DIR = path.join(
  process.cwd(),
  'packages/email-editor-localization/lingui',
);

export const ZH_PO_PATH = path.join(LINGUI_DIR, 'zh-Hans', 'messages.po');

export const SNAPSHOT_PATH = path.join(process.cwd(), '.i18n-ref-snapshot.json');

/** 中文 key → 中台 sourceHash（服务端回写，下次 pull 只传 hash） */
export const KEY_MAP_PATH = path.join(process.cwd(), '.i18n-key-map.json');

/** 各语言上次成功 pull 的 hash 集合（增量 diff 基线） */
export const PULL_SNAPSHOT_PATH = path.join(
  process.cwd(),
  '.i18n-pull-snapshot.json',
);

/** 本地文件名 → 中台 Language.code */
export const LOCAL_TO_CANONICAL: Record<string, string> = {
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  it: 'it-IT',
  tr: 'tr-TR',
};

/** 中台 code → 本地文件名 */
export const CANONICAL_TO_LOCAL: Record<string, string> = {
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  'en-US': 'en',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'it-IT': 'it',
  'tr-TR': 'tr',
};

export function getConfig() {
  const apiBase = (
    process.env.I18N_API_BASE ||
    'http://localhost:8000/admin-api/v1'
  ).replace(/\/$/, '');
  return {
    apiBase,
    project: process.env.I18N_PROJECT || 'email-editor',
    namespace: process.env.I18N_NAMESPACE || 'email-editor',
    apiKey: process.env.I18N_API_KEY || '',
    pusher:
      process.env.I18N_PUSHER ||
      process.env.USER ||
      process.env.USERNAME ||
      'local',
    clientVersion: process.env.I18N_CLIENT_VERSION || '',
  };
}

export type LocaleMap = Record<string, string>;

export function readJsonLocale(fileBase: string): LocaleMap {
  const file = path.join(LOCALES_DIR, `${fileBase}.json`);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8')) as LocaleMap;
}

export function writeJsonLocale(fileBase: string, data: LocaleMap) {
  const file = path.join(LOCALES_DIR, `${fileBase}.json`);
  const sorted: LocaleMap = {};
  for (const k of Object.keys(data).sort()) {
    sorted[k] = data[k];
  }
  fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
}

export function poFilePath(localLang: string) {
  return path.join(LINGUI_DIR, localLang, 'messages.po');
}

export function unescapePo(s: string) {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

export function escapePo(s: string) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

export interface PoMessage {
  context: string;
  msgid: string;
  msgstr: string;
}

/** 解析 .po → {context, msgid, msgstr}[]（跳过 header 空 msgid） */
export function parsePoMessages(file: string): PoMessage[] {
  if (!fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, 'utf8');
  const out: PoMessage[] = [];
  for (const block of text.split(/\n\n+/)) {
    const ctxMatch = block.match(/^msgctxt\s+"((?:\\.|[^"\\])*)"/m);
    const idMatch = block.match(/^msgid\s+"((?:\\.|[^"\\])*)"/m);
    const strMatch = block.match(/^msgstr\s+"((?:\\.|[^"\\])*)"/m);
    if (!idMatch) continue;
    const msgid = unescapePo(idMatch[1]);
    if (!msgid) continue;
    out.push({
      context: ctxMatch ? unescapePo(ctxMatch[1]) : '',
      msgid,
      msgstr: strMatch ? unescapePo(strMatch[1]) : '',
    });
  }
  return out;
}

/**
 * 解析 .po → catalogKey → msgstr（跳过 header 空 msgid）。
 * catalogKey = formatCatalogKey(msgid, msgctxt)。
 */
export function parsePoFile(file: string): LocaleMap {
  const map: LocaleMap = {};
  for (const m of parsePoMessages(file)) {
    map[formatCatalogKey(m.msgid, m.context)] = m.msgstr;
  }
  return map;
}

/**
 * 当前引用集合：以 zh-Hans PO 为准（Lingui 真相源）。
 * 有 msgctxt 时返回 catalog key（含 \\u0004）；PO 不存在时回退 locales/zh-Hans.json。
 */
export function loadCurrentKeys(): string[] {
  const fromPo = parsePoFile(ZH_PO_PATH);
  if (Object.keys(fromPo).length > 0) {
    return Object.keys(fromPo).sort();
  }
  console.warn('[i18n] zh-Hans PO 为空或不存在，回退 locales/zh-Hans.json');
  return Object.keys(readJsonLocale('zh-Hans')).sort();
}

/** 当前 zh-Hans 消息列表（含 context） */
export function loadCurrentMessages(): PoMessage[] {
  const fromPo = parsePoMessages(ZH_PO_PATH);
  if (fromPo.length > 0) return fromPo;
  console.warn('[i18n] zh-Hans PO 为空或不存在，回退 locales/zh-Hans.json');
  return Object.keys(readJsonLocale('zh-Hans'))
    .sort()
    .map((msgid) => ({ context: '', msgid, msgstr: msgid }));
}

export interface RefSnapshot {
  project: string;
  namespace: string;
  syncedAt: string;
  keys: string[];
}

export function loadSnapshot(): RefSnapshot | null {
  if (!fs.existsSync(SNAPSHOT_PATH)) return null;
  return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8')) as RefSnapshot;
}

export function saveSnapshot(snapshot: RefSnapshot) {
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + '\n');
}

export interface KeyMapFile {
  namespace: string;
  updatedAt: string;
  /** 中文 key → sourceHash */
  keyToHash: Record<string, string>;
}

export function loadKeyMap(): KeyMapFile {
  if (!fs.existsSync(KEY_MAP_PATH)) {
    return { namespace: '', updatedAt: '', keyToHash: {} };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(KEY_MAP_PATH, 'utf8')) as KeyMapFile;
    return {
      namespace: raw.namespace || '',
      updatedAt: raw.updatedAt || '',
      keyToHash: raw.keyToHash || {},
    };
  } catch {
    return { namespace: '', updatedAt: '', keyToHash: {} };
  }
}

export function saveKeyMap(map: KeyMapFile) {
  fs.writeFileSync(KEY_MAP_PATH, JSON.stringify(map, null, 2) + '\n', 'utf8');
}

/** 合并服务端回写的 keyHashes */
export function mergeKeyHashes(
  keyHashes: Record<string, string>,
  namespace: string,
) {
  const cur = loadKeyMap();
  const next: KeyMapFile = {
    namespace: namespace || cur.namespace,
    updatedAt: new Date().toISOString(),
    keyToHash: { ...cur.keyToHash, ...keyHashes },
  };
  saveKeyMap(next);
  return next;
}

export interface PullSnapshotFile {
  updatedAt: string;
  /** localLang → 已成功拉取过的 sourceHash 集合 */
  byLang: Record<string, string[]>;
}

export function loadPullSnapshot(): PullSnapshotFile {
  if (!fs.existsSync(PULL_SNAPSHOT_PATH)) {
    return { updatedAt: '', byLang: {} };
  }
  try {
    const raw = JSON.parse(
      fs.readFileSync(PULL_SNAPSHOT_PATH, 'utf8'),
    ) as PullSnapshotFile;
    return {
      updatedAt: raw.updatedAt || '',
      byLang: raw.byLang || {},
    };
  } catch {
    return { updatedAt: '', byLang: {} };
  }
}

export function savePullSnapshot(snap: PullSnapshotFile) {
  fs.writeFileSync(
    PULL_SNAPSHOT_PATH,
    JSON.stringify(snap, null, 2) + '\n',
    'utf8',
  );
}

/** 记录某语言本次拉取到的 hashes（与既有并集） */
export function markPulledHashes(localLang: string, hashes: string[]) {
  const snap = loadPullSnapshot();
  const prev = new Set(snap.byLang[localLang] || []);
  for (const h of hashes) prev.add(h);
  snap.byLang[localLang] = [...prev].sort();
  snap.updatedAt = new Date().toISOString();
  savePullSnapshot(snap);
  return snap;
}

/**
 * 把本地 catalog keys 拆成：已有 hash 的走 hashes；未知的走 keys/items（并附候选 hash）。
 * keys 入参为 catalog key（有 context 时含 \\u0004）。
 * mode=delta：跳过「已 pull 且本地已有非中文占位译文」的词；仍为空/等于 msgid 的会重拉。
 */
export function planPullIds(options: {
  keys: string[];
  mode: 'full' | 'delta';
  localLang: string;
  namespace: string;
  /** 该语言本地 PO/json，用于 delta 判断是否仍是中文占位 */
  localEntries?: LocaleMap;
}): {
  hashes: string[];
  /** 无 map 时发给 API 的 msgid（context 为空或不带 context 的兜底） */
  keys: string[];
  /** 无 map 且有 context 时发给 API */
  items: Array<{ key: string; context: string }>;
  /** 本次需要拉取/补齐的 catalog keys（未因 delta 跳过） */
  neededCatalogKeys: string[];
  skippedAsPulled: number;
  mapped: number;
  unmapped: number;
} {
  const map = loadKeyMap().keyToHash;
  const pulled = new Set(
    options.mode === 'delta'
      ? loadPullSnapshot().byLang[options.localLang] || []
      : [],
  );
  const localEntries = options.localEntries || {};

  const hashes: string[] = [];
  const keys: string[] = [];
  const items: Array<{ key: string; context: string }> = [];
  const neededCatalogKeys: string[] = [];
  let skippedAsPulled = 0;
  let mapped = 0;
  let unmapped = 0;

  const stillNeedsRemote = (catalogKey: string) => {
    const local = (localEntries[catalogKey] ?? '').trim();
    const { key: msgid } = parseCatalogKey(catalogKey);
    // 空、或仍等于中文 msgid（含 pull 中文补齐）→ 增量也要再拉
    return !local || local === msgid || local === catalogKey;
  };

  for (const catalogKey of options.keys) {
    const { key: msgid, context } = parseCatalogKey(catalogKey);
    const mappedHash = map[catalogKey] || (!context ? map[msgid] : undefined);
    if (mappedHash) {
      mapped += 1;
      if (
        options.mode === 'delta' &&
        pulled.has(mappedHash) &&
        !stillNeedsRemote(catalogKey)
      ) {
        skippedAsPulled += 1;
        continue;
      }
      neededCatalogKeys.push(catalogKey);
      hashes.push(mappedHash);
    } else {
      unmapped += 1;
      neededCatalogKeys.push(catalogKey);
      // 未知 map：传 msgid +（有 context 时）items；并附候选 hash
      keys.push(msgid);
      if (context) items.push({ key: msgid, context });
      for (const h of entryIdCandidates(options.namespace, msgid, context)) {
        hashes.push(h);
      }
    }
  }

  return {
    hashes: [...new Set(hashes)],
    keys: [...new Set(keys)],
    items: dedupeItems(items),
    neededCatalogKeys: [...new Set(neededCatalogKeys)],
    skippedAsPulled,
    mapped,
    unmapped,
  };
}

export interface DiffResult {
  added: string[];
  removed: string[];
  unchanged: string[];
  current: string[];
  /** 基线来源：remote | snapshot | empty */
  baselineSource: 'remote' | 'snapshot' | 'empty';
  baselineCount: number;
  /** 远端/快照都没有基线时，视为首次全量 */
  isFirstSync: boolean;
}

export function computeDiffAgainst(
  baselineKeys: string[],
  currentKeys?: string[],
  baselineSource: DiffResult['baselineSource'] = 'empty',
): DiffResult {
  const current = currentKeys || loadCurrentKeys();
  const prev = new Set(baselineKeys);
  const curr = new Set(current);
  const isFirstSync = baselineSource === 'empty' || prev.size === 0;

  if (isFirstSync && baselineSource === 'empty') {
    return {
      added: [...current],
      removed: [],
      unchanged: [],
      current,
      baselineSource,
      baselineCount: 0,
      isFirstSync: true,
    };
  }

  return {
    added: current.filter((k) => !prev.has(k)),
    removed: [...prev].filter((k) => !curr.has(k)),
    unchanged: current.filter((k) => prev.has(k)),
    current,
    baselineSource,
    baselineCount: prev.size,
    isFirstSync: false,
  };
}

/** @deprecated 仅本地快照；请用 resolveDiff */
export function computeDiff(currentKeys?: string[]): DiffResult {
  const snap = loadSnapshot();
  const baseline = snap?.keys || [];
  return computeDiffAgainst(
    baseline,
    currentKeys,
    baseline.length ? 'snapshot' : 'empty',
  );
}

export async function fetchRemoteRefKeys(): Promise<{
  keys: string[];
  lastRefSyncAt: string | null;
} | null> {
  const cfg = getConfig();
  try {
    const data = await apiRequest<{
      keys?: string[];
      lastRefSyncAt?: string | null;
    }>('GET', '/i18n/client/refs', undefined, {
      project: cfg.project,
      namespace: cfg.namespace,
    });
    return {
      keys: Array.isArray(data?.keys) ? [...data.keys].sort() : [],
      lastRefSyncAt: data?.lastRefSyncAt ?? null,
    };
  } catch (e: any) {
    console.warn('[i18n] fetch remote refs failed:', e?.message || e);
    return null;
  }
}

export type BaselineMode = 'auto' | 'remote' | 'local';

/**
 * 解析 diff 基线：
 * - auto（默认）：优先远端 active refs；失败再用本地快照；都没有 → empty
 * - remote：必须拉远端（失败则抛错）
 * - local：只用本地快照
 */
export async function resolveDiff(options?: {
  mode?: BaselineMode;
  currentKeys?: string[];
}): Promise<DiffResult> {
  const mode = options?.mode || 'auto';
  const current = options?.currentKeys || loadCurrentKeys();

  if (mode === 'local') {
    const snap = loadSnapshot();
    const baseline = snap?.keys || [];
    return computeDiffAgainst(
      baseline,
      current,
      baseline.length ? 'snapshot' : 'empty',
    );
  }

  const remote = await fetchRemoteRefKeys();

  if (mode === 'remote') {
    if (!remote) {
      throw new Error(
        '无法拉取远端引用清单（GET /i18n/client/refs）。请检查 I18N_API_BASE / 项目是否存在。',
      );
    }
    // 拉到远端后顺手刷新本地快照，避免下次离线偏差
    const cfg = getConfig();
    saveSnapshot({
      project: cfg.project,
      namespace: cfg.namespace,
      syncedAt: new Date().toISOString(),
      keys: remote.keys,
    });
    return computeDiffAgainst(remote.keys, current, 'remote');
  }

  // auto
  if (remote) {
    const cfg = getConfig();
    saveSnapshot({
      project: cfg.project,
      namespace: cfg.namespace,
      syncedAt: new Date().toISOString(),
      keys: remote.keys,
    });
    return computeDiffAgainst(remote.keys, current, 'remote');
  }

  const snap = loadSnapshot();
  if (snap?.keys?.length) {
    console.warn('[i18n] 远端不可用，回退本地快照（可能有偏差）');
    return computeDiffAgainst(snap.keys, current, 'snapshot');
  }

  console.warn('[i18n] 无远端引用且无本地快照，按首次全量处理');
  return computeDiffAgainst([], current, 'empty');
}

function formatKeyForLog(catalogKey: string): string {
  const { key, context } = parseCatalogKey(catalogKey);
  return context ? `[${context}] ${key}` : key;
}

export function printDiff(diff: DiffResult) {
  console.log(
    `[diff] baseline=${diff.baselineSource}(${diff.baselineCount}) current=${diff.current.length} added=${diff.added.length} removed=${diff.removed.length} unchanged=${diff.unchanged.length}${diff.isFirstSync ? ' (first sync → full)' : ''}`,
  );
  if (diff.added.length) {
    console.log('\n新增:');
    diff.added.slice(0, 50).forEach((k) => console.log(`  + ${formatKeyForLog(k)}`));
    if (diff.added.length > 50) console.log(`  ... 另 ${diff.added.length - 50} 条`);
  }
  if (diff.removed.length) {
    console.log('\n减少:');
    diff.removed.slice(0, 50).forEach((k) => console.log(`  - ${formatKeyForLog(k)}`));
    if (diff.removed.length > 50) console.log(`  ... 另 ${diff.removed.length - 50} 条`);
  }
}

export type BuildEntriesOptions = {
  /** 要推的中台语言码；默认仅 zh-CN（中文即唯一 key/hash） */
  langs?: string[];
};

/** 组装推送译文：key=中文 msgid，可选 context；translations 用中台语言码 */
export function buildTranslationEntries(
  keys?: string[],
  options?: BuildEntriesOptions,
) {
  const keyList = keys || loadCurrentKeys();
  const onlyLangs = options?.langs?.length
    ? new Set(options.langs)
    : new Set(['zh-CN']);

  const localeFiles = Object.keys(LOCAL_TO_CANONICAL).filter((local) =>
    onlyLangs.has(LOCAL_TO_CANONICAL[local]),
  );
  const maps: Record<string, LocaleMap> = {};
  for (const f of localeFiles) {
    maps[f] = readJsonLocale(f);
  }

  return keyList.map((catalogKey) => {
    const { key, context } = parseCatalogKey(catalogKey);
    const translations: Record<string, string> = {};
    for (const [local, canonical] of Object.entries(LOCAL_TO_CANONICAL)) {
      if (!onlyLangs.has(canonical)) continue;
      const val = maps[local]?.[catalogKey] ?? maps[local]?.[key];
      if (val != null && val !== '') {
        translations[canonical] = val;
      }
    }
    // 保证有 zh-CN（msgid 本身就是中文；不把 context 拼进文案）
    if (onlyLangs.has('zh-CN') && !translations['zh-CN']) {
      translations['zh-CN'] = key;
    }
    return context
      ? { key, context, translations }
      : { key, translations };
  });
}

export async function apiRequest<T = unknown>(
  method: 'GET' | 'POST',
  apiPath: string,
  body?: unknown,
  query?: Record<string, string | undefined>,
): Promise<T> {
  const { apiBase, apiKey, pusher } = getConfig();
  const url = new URL(`${apiBase}${apiPath.startsWith('/') ? '' : '/'}${apiPath}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null && v !== '') url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (apiKey) headers['X-I18n-Api-Key'] = apiKey;
  if (pusher) headers['X-I18n-Pusher'] = pusher;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(
      `${method} ${url.pathname} failed ${res.status}: ${typeof json === 'string' ? json : JSON.stringify(json)}`,
    );
  }

  // Nest 统一包装 { code, message, data }：业务失败也常是 HTTP 200 + code≠200
  if (
    json &&
    typeof json === 'object' &&
    'code' in json &&
    json.code != null &&
    Number(json.code) !== 200
  ) {
    const msg =
      typeof json.message === 'string'
        ? json.message
        : JSON.stringify(json.message ?? json);
    throw new Error(`${method} ${url.pathname} business ${json.code}: ${msg}`);
  }

  if (json && typeof json === 'object' && 'data' in json && json.data !== undefined) {
    return json.data as T;
  }
  return json as T;
}

export function parseArgs(argv: string[]) {
  const flags: Record<string, string | boolean> = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else {
      rest.push(a);
    }
  }
  return { flags, rest };
}
