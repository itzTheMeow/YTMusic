import { Auth } from "index";
import { Socket, io } from "socket.io-client";
import { writable } from "svelte/store";
import type {
  APIArtistGetRequest,
  APIArtistSearchRequest,
  APIErrorResponse,
  APILoginRequest,
  APILoginResponse,
  APIPasswordChangeRequest,
  APISettingsSetRequest,
  APITrackSearchRequest,
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

type QueueCallback = (c: QueueItem & { is: "add" | "remove" }) => any;

export const Queue = writable<QueueItem[]>([]);

export default class {
  public socket: Socket | null = null;
  constructor(public readonly url: string) {
    this.connect();
    setInterval(() => {
      if (this.socket?.connected) this.socket.emit("wantSync");
    }, 1000 * 60); // every minute sync queue
  }
  public connect() {
    if (this.socket) this.socket.disconnect();
    this.socket = io();
    this.socket.on("connect", () => {
      console.log("Socket Connected");
    });
    this.socket.on("disconnect", (reason) => {
      console.log("Socket D/C: " + reason);
    });
    this.socket.on("sync", (nq: QueueItem[]) => {
      console.log(nq);
      Queue.update((q) => {
        q.forEach((i) => {
          if (!nq.find(({ id }) => id == i.id))
            this.queueListeners.forEach((l) => l.cb({ ...i, is: "remove" }));
        });
        nq.forEach((i) => {
          i.data = JSON.parse(atob(i.data));
          if (!q.find(({ id }) => id == i.id))
            this.queueListeners.forEach((l) => l.cb({ ...i, is: "add" }));
        });
        return nq;
      });
    });
    this.socket.on("add", (nq: QueueItem) => {
      Queue.update((q) => {
        nq.data = JSON.parse(atob(nq.data));
        this.queueListeners.forEach((l) => l.cb({ ...nq, is: "add" }));
        return [...q, nq];
      });
    });
    this.socket.on("remove", (nq: QueueItem) => {
      Queue.update((q) => {
        nq.data = JSON.parse(atob(nq.data));
        this.queueListeners.forEach((l) => l.cb({ ...nq, is: "remove" }));
        return q.filter(({ id }) => id !== nq.id);
      });
    });
  }
  private sanitizePath(path: string) {
    return !path.startsWith("/") ? "/" + path : path;
  }
  public async post<REQ extends {}, RES extends {}>(
    path: string,
    data: REQ
  ): Promise<({ err: true } & APIErrorResponse) | ({ err: false } & RES)> {
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
  public async getSettings() {
    return await this.post<{}, Settings>("/settings_get", {});
  }
  public async setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    return await this.post<APISettingsSetRequest, {}>("/settings_set", {
      key,
      value: String(value),
    });
  }
  public async changePassword(oldPass: string, newPass: string) {
    return await this.post<APIPasswordChangeRequest, {}>("/pass_change", {
      old: oldPass,
      new: newPass,
    });
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
