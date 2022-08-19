export default class {
  constructor(public readonly url: string) {}
  private sanitizePath(path: string) {
    return !path.startsWith("/") ? "/" + path : path;
  }
  public async get(path: string): Promise<any> {
    return await fetch(this.url + this.sanitizePath(path)).then((r) =>
      r.json()
    );
  }
  public async post(path: string, data: object): Promise<any> {
    return await fetch(this.url + this.sanitizePath(path), {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((r) => r.json());
  }

  public async login(
    username: string,
    password: string
  ): Promise<{ err: true; message: string } | { err: false; token: string }> {
    try {
      return await this.post("/login", { username, password });
    } catch {
      return { err: true, message: "Error making request." };
    }
  }
}
