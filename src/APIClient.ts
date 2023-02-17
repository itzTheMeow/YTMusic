import { Auth } from "index";
import { writable } from "svelte/store";
import type {
  APIArtistGetRequest,
  APIArtistSearchRequest,
  APIErrorResponse,
  APILoginRequest,
  APILoginResponse,
  APITrackSearchRequest,
  WSPacket,
} from "typings";
import type { QueueItem } from "typings_queue";
import {
  MetaProviderSpotify,
  type Artist,
  type Downloadable,
  type MetadataProvider,
  type Settings,
  type SoundProvider,
} from "typings_struct";

type Res<T extends {}> = Promise<({ err: true } & APIErrorResponse) | ({ err: false } & T)>;
type QueueCallback = (c: QueueItem & { is: "add" | "remove" }) => any;

export const Queue = writable<QueueItem[]>([]);

export default class {
  public socket: WebSocket | null = null;
  public connected = false;
  constructor(public readonly url: string) {
    this.connect();
    setInterval(() => {
      if (this.connected) this.socket?.send("wantSync");
    }, 1000 * 60); // every minute sync queue
  }
  public connect() {
    this.connected = false;
    if (this.socket) {
      const sock = this.socket;
      sock.close();
      this.socket.onopen = () => sock.close();
      this.socket.onclose = this.socket.onerror = this.socket.onmessage = null;
    }
    this.socket = new WebSocket(
      window.location.protocol.replace("http", "ws") + "//" + window.location.host + "/ws"
    );
    this.socket.onopen = () => {
      this.connected = true;
      console.log("Socket Connect");
    };
    this.socket.onclose = () => {
      this.connected = false;
      console.log("Socket D/C");
      this.socket?.close();
      setTimeout(() => this.connect(), 1000);
    };
    this.socket.onerror = (e) => {
      this.connected = false;
      console.error("Socket Error", e);
      this.socket?.close();
      setTimeout(() => this.connect(), 1000);
    };
    this.socket.onmessage = ({ data }) => {
      try {
        const d = JSON.parse(data) as WSPacket;
        if (d.type == "sync") {
          Queue.update((q) => {
            const nq = <QueueItem[]>JSON.parse(d.data);
            q.forEach((i) => {
              if (!nq.find(({ id }) => id == i.id))
                this.queueListeners.forEach((l) => l.cb({ ...i, is: "remove" }));
            });
            nq.forEach((i) => {
              i.data = atob(i.data);
              if (!q.find(({ id }) => id == i.id))
                this.queueListeners.forEach((l) => l.cb({ ...i, is: "add" }));
            });
            return nq;
          });
        } else if (d.type == "add") {
          Queue.update((q) => {
            const nq = <QueueItem>JSON.parse(d.data);
            nq.data = atob(nq.data);
            this.queueListeners.forEach((l) => l.cb({ ...nq, is: "add" }));
            return [...q, nq];
          });
        } else if (d.type == "remove") {
          Queue.update((q) => {
            const nq = <QueueItem>JSON.parse(d.data);
            nq.data = atob(nq.data);
            this.queueListeners.forEach((l) => l.cb({ ...nq, is: "remove" }));
            return q.filter(({ id }) => id !== nq.id);
          });
        }
      } catch {}
    };
  }
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

  private queueListeners: {
    id: number;
    cb: QueueCallback;
  }[] = [];
  public onQueueChange(cb: QueueCallback) {
    const id = Date.now();
    this.queueListeners.push({ id, cb });
    return id;
  }
  public offQueueChange(id: number) {
    const i = this.queueListeners.findIndex((q) => q.id == id);
    if (i >= 0) this.queueListeners.splice(i, 1);
  }
}
