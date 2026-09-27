export class ServiceContainer {
  private readonly services = new Map<string, unknown>();

  register<T>(id: string, service: T): void {
    this.services.set(id, service);
  }

  get<T>(id: string): T | undefined {
    return this.services.get(id) as T | undefined;
  }

  has(id: string): boolean {
    return this.services.has(id);
  }

  clear(): void {
    this.services.clear();
  }
}
