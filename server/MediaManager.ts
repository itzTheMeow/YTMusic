import fs from "fs";
import Artist from "./Artist";

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
  }

  writeData() {
    fs.writeFileSync(this.MediaPaths.artists, JSON.stringify(this.artists));
  }

  addArtist(data: Artist) {
    if (this.artists.find((a) => a.id == data.id)) return;
    this.artists.push(data);
    this.writeData();
  }
}

export default MediaManager;
