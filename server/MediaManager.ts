import fs from "fs";
import { join } from "path";
import config from "./config";
import {
  constructAlbum,
  constructArtist,
  constructTrack,
} from "./constructors";
import { Spotify } from "./server";
import { Album, Artist, QueuedAction } from "./struct";

export function sanitizeFileName(str: string) {
  return [...str]
    .map((c) => (config.disallowFilesystemCharacters.includes(c) ? "_" : c))
    .join("");
}

export interface ArtistMeta extends Artist {
  version: 1;
  albums: Album[];
}

export default class MediaManager {
  private events: {
    id: QueuedAction["type"];
    run: (action: QueuedAction)=>any;
  }[] = [];
  public dir: string;
  public artists: ArtistMeta[] = [];
  public queue: QueuedAction[] = [];

  constructor() {
    this.dir = fs.readFileSync(join(process.cwd(), "dir")).toString().trim();
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir);
    this.init();
    this.queueAction({ type: "LibraryScan" });
  }
  public init() {
    fs.readdirSync(process.cwd() + "/serverDist/queue").forEach((r) => {
      require("./queur/" + r);
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
  public async addArtist(id: string) {
    return new Promise<ArtistMeta>(async (res) => {
      try {
        const artist = (await Spotify.api.getArtist(id)).body;
        const newArtist: ArtistMeta = {
          version: 1,
          ...constructArtist(artist),
          albums: [],
        };
        new Promise((doneAlbums) => {
          let albumOffset = 0;
          async function newAlbumSet() {
            const artistAlbums = (
              await Spotify.api.getArtistAlbums(artist.id, {
                limit: 50,
                offset: albumOffset,
              })
            ).body.items;
            artistAlbums.map((a) => {
              if (
                a.album_type == "compilation" ||
                !a.artists.map((a) => a.id).includes(artist.id)
              )
                return;
              newArtist.albums.push(constructAlbum(a));
            });
            if (artistAlbums.length == 50) {
              albumOffset += 50;
              newAlbumSet();
            } else {
              doneAlbums(void 0);
            }
          }
          newAlbumSet();
        }).then(() => {
          new Promise((doneSongs) => {
            let albumsDone = 0;
            newArtist.albums.forEach(async (a) => {
              let trackOffset = 0;
              let songs: SpotifyApi.TrackObjectSimplified[] = [];
              async function newTrackSet() {
                Spotify.api
                  .getAlbumTracks(a.id, { limit: 50, offset: trackOffset })
                  .then((r) => {
                    let albumSongs = r.body.items;
                    albumSongs.map((s) => {
                      songs.push(s);
                    });
                    if (albumSongs.length == 50) {
                      trackOffset += 50;
                      setTimeout(newTrackSet, 500);
                    } else {
                      albumsDone++;
                      a.tracks = songs.map(constructTrack);
                      if (albumsDone >= newArtist.albums.length)
                        doneSongs(void 0);
                    }
                  })
                  .catch(() => {
                    setTimeout(newTrackSet, 1000);
                  });
              }
              newTrackSet();
            });
          }).then(() => {
            const path = join(this.dir, sanitizeFileName(newArtist.name));
            if (!fs.existsSync(path)) fs.mkdirSync(path);
            fs.writeFileSync(
              join(path, "artist.json"),
              JSON.stringify(newArtist)
            );
            this.artists.push(newArtist);
            res(newArtist);
          });
        });
      } catch {
        res(null);
      }
    });
  }
}
