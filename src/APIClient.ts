import { Auth } from "index";
import type { APIResponse, Artist } from "../server/struct";

type Res<T extends object> = Promise<
  | Extract<APIResponse, { err: true }>
  | (Extract<APIResponse, { err: false }> & T)
>;

export default class {
  constructor(public readonly url: string) {}
  private sanitizePath(path: string) {
    return !path.startsWith("/") ? "/" + path : path;
  }
  public async get(path: string, query?: Record<string, string>): Promise<any> {
    try {
      return await fetch(
        this.url +
          this.sanitizePath(path) +
          `?${new URLSearchParams(query).toString()}`
      ).then((r) => r.json());
    } catch (err) {
      return { err: true, message: `Error making request: ${err}` };
    }
  }
  public async post(path: string, data: object): Promise<any> {
    try {
      return await fetch(this.url + this.sanitizePath(path), {
        method: "POST",
        body: JSON.stringify({ auth: Auth.authKey, ...data }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((r) => r.json());
    } catch (err) {
      return { err: true, message: `Error making request: ${err}` };
    }
  }

  public async login(
    username: string,
    password: string
  ): Res<{ token: string }> {
    return await this.post("/login", { username, password });
  }
  public async searchSpotify(term: string): Res<{ list: Artist[] }> {
    return await this.post("/spotify_search", {
      term,
    });
  }
  public async listArtists(): Res<{ list: Artist[] }> {
    return await this.post("/artist_list", {});
  }
}
