export class PluginLocalStorage {
  readonly #key: string;

  public constructor(key: string) {
    this.#key = key;
  }

  public updateVersion = (currentVersion: string) => {
    const stored = localStorage.getItem(this.#key) ?? '{}';
    const parsed = JSON.parse(stored);

    const latestVersion: string = parsed.latestVersion ?? currentVersion;

    const newStorage = {
      ...parsed,
      version: currentVersion,
    };

    const [latestMajor, latestMinor] = latestVersion.split('.').map((v) => parseInt(v, 10));
    const [currentMajor, currentMinor] = currentVersion.split('.').map((v) => parseInt(v, 10));

    newStorage.hasNewVersion =
      latestMajor > currentMajor || (latestMajor === currentMajor && latestMinor > currentMinor);

    localStorage.setItem(this.#key, JSON.stringify(newStorage));
  };

  get hasNewVersion(): boolean {
    const stored = localStorage.getItem(this.#key) ?? '{}';
    const parsed = JSON.parse(stored);

    return parsed.hasNewVersion ?? false;
  }
}
