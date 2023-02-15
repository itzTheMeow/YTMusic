import { Auth } from "index";
import type {
  APIArtistGetRequest,
  APIArtistSearchRequest,
  APIErrorResponse,
  APILoginRequest,
  APILoginResponse,
  APITrackSearchRequest,
} from "typings";
import {
  MetaProviderSpotify,
  type Artist,
  type Downloadable,
  type MetadataProvider,
  type SoundProvider,
} from "typings_struct";

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
  public async searchArtists(query: string, provider: MetadataProvider = MetaProviderSpotify) {
    return await this.post<APIArtistSearchRequest, Artist[]>("/artist_search", {
      query,
      provider,
    });
  }
  public async listArtists() {
    return await this.post<{}, Artist[]>("/artist_list", {});
  }
  public async fetchArtist(id: string) {
    return await this.post<APIArtistGetRequest, Artist>("/artist_get", { id });
  }
  public async searchTrack(provider: SoundProvider, query: string) {
    return await this.post<APITrackSearchRequest, Downloadable[]>("/track_search", {
      provider,
      query,
    });
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
