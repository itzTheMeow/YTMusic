export default class {
  constructor(public readonly url: string) {}
  private sanitizePath(path: string) {
    return !path.startsWith("/") ? "/" + path : path;
  }
  public async get(path: string): Promise<Object> {
    return await fetch(this.url + this.sanitizePath(path)).then((r) =>
      r.json()
    );
  }

  public async login(username: string, password: string) {
    try {
      return await this.get("/login");
    } catch {}
  }
}
