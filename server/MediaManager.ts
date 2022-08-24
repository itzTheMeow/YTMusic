import fs from "fs";
import { join } from "path";
import SpotifyWebApi from "spotify-web-api-node";
import config from "./config";
import { constructAlbum, constructArtist, constructTrack } from "./constructors";
import { Spotify } from "./server";
import { Album, Artist } from "./struct";

export function sanitizeFileName(str: string) {
  return [...str].map((c) => (config.disallowFilesystemCharacters.includes(c) ? "_" : c)).join("");
}

interface ArtistMeta extends Artist {
  version: 1;
  albums: Album[];
}

export default class MediaManager {
  public dir: string;
  public artists: ArtistMeta[] = [];

  constructor() {
    this.dir = fs.readFileSync(join(process.cwd(), "dir")).toString().trim();
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir);
    this.scan();
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
              if (a.album_type == "compilation" || !a.artists.map((a) => a.id).includes(artist.id))
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
                      if (albumsDone >= newArtist.albums.length) doneSongs(void 0);
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
            fs.writeFileSync(join(path, "artist.json"), JSON.stringify(newArtist));
            this.artists.push(newArtist);
            res(newArtist);
          });
        });
      } catch {
        res(null);
      }
    });
  }

  public scan() {
    console.log("Scanning artist folders...");
    const artists = fs.readdirSync(this.dir);
    const newData = [];
    artists.forEach((a) => {
      try {
        const path = join(this.dir, a);
        const files = fs.readdirSync(path);
        if (!files.includes("artist.json")) return;
        const meta = JSON.parse(
          fs.readFileSync(join(path, "artist.json")).toString()
        ) as ArtistMeta;
        if (meta.version !== 1)
          return console.log(`Old Artist Format in '${a}' (${meta.version || 0}). Please update.`);
        newData.push(meta);
      } catch {
        console.log(`Unrecognized Artist Folder: ${a}`);
      }
    });
    this.artists = newData;
    console.log("Scan complete!");
  }
}
