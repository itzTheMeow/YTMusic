import fs from "fs";
import Artist from "./Artist";

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
  public artists: Artist[] = [];
  public MediaPaths: { [key: string]: string };

  constructor(dir: string) {
    this.location = dir;
    this.MediaPaths = {
      artists: `${this.location}/artists.json`,
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

    this.scanDisk();
  }

  writeData() {
    fs.writeFileSync(this.MediaPaths.artists, JSON.stringify(this.artists));
  }

  addArtist(data: Artist) {
    if (this.artists.find((a) => a.id == data.id)) return;
    this.artists.push(data);
    this.writeData();
    this.scanDisk();
  }

  scanArtistFolders() {
    this.artists.forEach((artist) => {
      let apath = `${this.location}/${filterName(artist.name)}`;
      try {
        fs.accessSync(apath);
      } catch (err) {
        fs.mkdirSync(apath);
      }
    });
  }
  scanDisk() {
    this.scanArtistFolders();
  }
}

export default MediaManager;
