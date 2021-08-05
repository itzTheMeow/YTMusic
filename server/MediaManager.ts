import fs from "fs";
import { MusicBrainzApi } from "musicbrainz-api";
import Artist from "./Artist";
import MediaCollection from "./MediaCollection";

function filterName(name: string) {
  let allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-_()!@#%& .,";
  let newName = "";
  name.split("").forEach((n) => {
    if (allowed.includes(n)) newName += n;
  });
  return newName;
}

class MediaManager {
  public location: string;
  public mb: MusicBrainzApi;

  public artists: Artist[] = [];
  public collections: MediaCollection[] = [];
  public MediaPaths: { [key: string]: string };

  constructor(dir: string, mb: MusicBrainzApi) {
    this.location = dir;
    this.mb = mb;
    this.MediaPaths = {
      artists: `${this.location}/artists.json`,
      songs: `/songs.json`,
    };

    try {
      fs.accessSync(this.location);
    } catch (err) {
      fs.mkdirSync(this.location);
    }

    try {
      fs.accessSync(this.MediaPaths.artists);
    } catch (err) {
      fs.writeFileSync(this.MediaPaths.artists, "[]");
    }
    this.artists = JSON.parse(String(fs.readFileSync(this.MediaPaths.artists))) as Artist[];
    this.scanArtistFolders().then(() => {
      this.artists.forEach((a) => {
        let collection = JSON.parse(
          String(fs.readFileSync(`${this.location}/${filterName(a.name)}${this.MediaPaths.songs}`))
        );
        this.collections.push(collection);
      });
    });
  }

  getCollection(artist: Artist) {
    return this.collections.find((c) => c.artist == artist);
  }

  writeData() {
    fs.writeFileSync(this.MediaPaths.artists, JSON.stringify(this.artists));
    this.artists.forEach((a) => {
      fs.writeFileSync(
        `${this.location}/${filterName(a.name)}${this.MediaPaths.songs}`,
        JSON.stringify(this.getCollection(a) || {})
      );
    });
  }

  addArtist(data: Artist) {
    if (this.artists.find((a) => a.id == data.id)) return;
    this.artists.push(data);
    this.scanArtistFolders();
    this.writeData();
  }

  scanArtistFolders() {
    return new Promise((resm) => {
      this.artists.forEach((artist) => {
        let apath = `${this.location}/${filterName(artist.name)}`;
        try {
          fs.accessSync(apath);
        } catch (err) {
          fs.mkdirSync(apath);
        }
        let mpath = `${this.location}/${filterName(artist.name)}${this.MediaPaths.songs}`;
        try {
          fs.accessSync(mpath);
        } catch (err) {
          let allSongs: any[] = [];
          if (artist.releases) allSongs = [...artist.releases];

          new Promise(async (res, rej) => {
            let groupSongs: any[] = [];
            let req = artist.releaseGroups?.length || 0;
            if (artist.releaseGroups)
              artist.releaseGroups.forEach(async (g) => {
                this.mb
                  .getReleaseGroup(g, ["releases", "release-rels"])
                  .then((group) => {
                    fs.writeFileSync("test2", JSON.stringify(group));
                    groupSongs.push(group.releases);
                  })
                  .catch((err) => {
                    req--;
                  });
              });
            else res([]);
          }).then((groupSongs) => {
            allSongs = [...allSongs, ...(groupSongs as any[])];
            resm(void 0);
          });
        }
      });
    });
  }
}

export default MediaManager;
