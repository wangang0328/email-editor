/**
 * 简单 LRU Map：get/set 时刷新顺序，超容量淘汰最久未用条目。
 * 用于 L1/L2 内存缓存，避免长时间编辑无限增长。
 */
export class LruStore<V> {
  private readonly map = new Map<string, V>();

  constructor(private readonly maxEntries: number) {}

  get size(): number {
    return this.map.size;
  }

  get(key: string): V | undefined {
    const value = this.map.get(key);
    if (value === undefined) {
      return undefined;
    }
    // 刷新 LRU 顺序
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
    this.evictIfNeeded();
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  private evictIfNeeded(): void {
    while (this.map.size > this.maxEntries) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey === undefined) {
        break;
      }
      this.map.delete(oldestKey);
    }
  }
}
