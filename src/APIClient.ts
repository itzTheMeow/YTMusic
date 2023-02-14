import { Auth } from "index";
import {
  MetaProviderSpotify,
  type APIErrorResponse,
  type APILoginRequest,
  type APILoginResponse,
  type Artist,
  type MetadataProvider,
} from "typings";

type Res<T extends {}> = Promise<({ err: true } & APIErrorResponse) | ({ err: false } & T)>;

export default class {
  constructor(public readonly url: string) {}
  private sanitizePath(path: string) {
    return !path.startsWith("/") ? "/" + path : path;
  }
  public async post<REQ extends {}, RES extends {}>(path: string, data: REQ): Res<RES> {
    try {
      return await fetch(this.url + this.sanitizePath(path), {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: Auth.authKey,
          "Content-Type": "application/json",
        },
      }).then((r) => r.json());
    } catch (err) {
      return { err: true, message: `Error making request: ${err}` };
    }
  }

  public async login(username: string, password: string) {
    return await this.post<APILoginRequest, APILoginResponse>("/login", {
      username,
      password,
    });
  }
  public async searchArtist(
    term: string,
    provider: MetadataProvider = MetaProviderSpotify
  ): Res<{ list: ArtistMeta[] }> {
    return (await this.post("/artist_search", {
      term,
      provider,
    })) as any;
  }
  public async listArtists(): Res<{ list: Artist[] }> {
    return (await this.post("/artist_list", {})) as any;
  }
  public async fetchArtist(id: string): Res<{ artist: ArtistMeta }> {
    return (await this.post("/artist_get", { id })) as any;
  }
  public async searchTrack(provider: SoundProviders, term: string): Res<{ list: Downloadable[] }> {
    return (await this.post("/track_search", {
      provider,
      term,
    })) as any;
  }
  public async getSettings(): Res<{ settings: Settings }> {
    return (await this.post("/settings_get", {})) as any;
  }
  public async setSetting<K extends keyof Settings>(k: K, v: Settings[K]): Res<{}> {
    return (await this.post("/settings_set", { k, v })) as any;
  }
  public async changePassword(oldPass: string, newPass: string): Res<{}> {
    return (await this.post("/pass_change", {
      old: oldPass,
      new: newPass,
    })) as any;
  }
}
