import { Auth } from "index";
import type {
  APIResponse,
  Artist,
  ArtistMeta,
  Downloadable,
  Settings,
  SoundProviders,
} from "../server/struct";

type Res<T extends object> = Promise<
  | Extract<APIResponse, { err: true }>
  | (Extract<APIResponse, { err: false }> & T)
>;

export default class {
  constructor(public readonly url: string) {}
  private sanitizePath(path: string) {
    return !path.startsWith("/") ? "/" + path : path;
  }
  public async get(
    path: string,
    query?: Record<string, string>
  ): Promise<APIResponse> {
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
  public async post(path: string, data: object): Promise<APIResponse> {
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
    return (await this.post("/login", { username, password })) as any;
  }
  public async searchArtist(term: string): Res<{ list: ArtistMeta[] }> {
    return (await this.post("/artist_search", {
      term,
    })) as any;
  }
  public async listArtists(): Res<{ list: Artist[] }> {
    return (await this.post("/artist_list", {})) as any;
  }
  public async fetchArtist(id: string): Res<{ artist: ArtistMeta }> {
    return (await this.post("/artist_get", { id })) as any;
  }
  public async searchTrack(
    provider: SoundProviders,
    artist: string,
    album: string,
    track: string
  ): Res<{ list: Downloadable[] }> {
    return (await this.post("/track_search", {
      provider,
      artist,
      album,
      track,
    })) as any;
  }
  public async getSettings(): Res<{ settings: Settings }> {
    return (await this.post("/settings_get", {})) as any;
  }
  public async setSetting<K extends keyof Settings>(
    k: K,
    v: Settings[K]
  ): Res<{}> {
    return (await this.post("/settings_set", { k, v })) as any;
  }
  public async changePassword(oldPass: string, newPass: string): Res<{}> {
    return (await this.post("/pass_change", {
      old: oldPass,
      new: newPass,
    })) as any;
  }
}
