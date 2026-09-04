export type CacheEntry<T> = {
  createdAt: number;
  val: T;
};

export class Cache {
  #cache = new Map<string, CacheEntry<any>>();
  #reapIntervalId: NodeJS.Timeout | undefined = undefined;
  #interval: number;

  constructor(interval: number) {
    this.#interval = interval;
    this.#startReapLoop();
  };

  add<T>(key: string, val: T) {
    this.#cache.set(key, { createdAt: Date.now(), val });
  };

  get<T>(key: string): T | undefined {
    return this.#cache.get(key)?.val;
  };

  #reap() {
    this.#cache.forEach((item, key) => {
      if (item.createdAt < Date.now() - this.#interval) {
        this.#cache.delete(key);
      }
    });
  };

  #startReapLoop() {
    const loopId = setInterval(() => this.#reap(), this.#interval);
    this.#reapIntervalId = loopId;
  };

  stopReapLoop() {
    clearInterval(this.#reapIntervalId);
    this.#reapIntervalId = undefined;
  };
};