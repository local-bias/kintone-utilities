export class PluginLocalStorage {
  readonly #key: string;
  #storage: Record<string, any>;

  public constructor(key: string) {
    this.#key = key;
    const stored = localStorage.getItem(this.#key) ?? '{}';
    this.#storage = JSON.parse(stored);
  }

  private save() {
    localStorage.setItem(this.#key, JSON.stringify(this.#storage));
  }

  public updateVersion = (currentVersion: string) => {
    const latestVersion: string = this.#storage.latestVersion ?? currentVersion;

    this.#storage.version = currentVersion;

    const [latestMajor, latestMinor] = latestVersion.split('.').map((v) => parseInt(v, 10));
    const [currentMajor, currentMinor] = currentVersion.split('.').map((v) => parseInt(v, 10));

    this.#storage.hasNewVersion =
      latestMajor > currentMajor || (latestMajor === currentMajor && latestMinor > currentMinor);

    this.save();
  };

  public get hasNewVersion(): boolean {
    return this.#storage.hasNewVersion ?? false;
  }
}
