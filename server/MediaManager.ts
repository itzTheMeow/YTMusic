import fs from "fs";
import { join } from "path";
import config from "./config";
import { Artist, ArtistMeta, QueuedAction } from "./struct";

export function sanitizeFileName(str: string) {
  return [...str]
    .map((c) => (config.disallowFilesystemCharacters.includes(c) ? "_" : c))
    .join("");
}

export default class MediaManager {
  private events: {
    id: QueuedAction["type"];
    run: (action: QueuedAction) => any;
  }[] = [];
  public dir: string;
  public artists: ArtistMeta[] = [];
  public queue: QueuedAction[] = [];
  public artistdir(a: Artist) {
    const path = join(this.dir, sanitizeFileName(a.name));
    if (fs.existsSync(path)) fs.mkdirSync(path);
    return path;
  }

  constructor() {
    this.dir = fs.readFileSync(join(process.cwd(), "dir")).toString().trim();
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir);
  }
  public init() {
    this.queueAction({ type: "LibraryScan" });
    fs.readdirSync(process.cwd() + "/serverDist/queue").forEach((r) => {
      require("./queue/" + r);
    });
  }
  public addEvent<Q extends QueuedAction["type"]>(
    name: Q,
    cb: (action: Extract<QueuedAction, { type: Q }>) => any
  ) {
    this.events.push({ id: name, run: cb });
  }
  public queueAction(action: QueuedAction) {
    this.queue.push(action);
    this.nextQueue();
  }
  private runningQueue = false;
  private async nextQueue() {
    if (this.runningQueue) return;
    const nextEvent = this.queue.shift();
    if (!nextEvent) return;
    this.runningQueue = true;
    try {
      await this.events.find((e) => e.id == nextEvent.type)?.run(nextEvent);
    } catch (err) {
      console.error(err);
    }
    this.runningQueue = false;
    this.nextQueue();
  }

  public hasArtist(id: string) {
    return !!this.artists.find((a) => a.id == id);
  }
}
