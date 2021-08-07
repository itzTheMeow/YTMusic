import fs from "fs";
import SpotifyWebApi from "spotify-web-api-node";
import ModifiedArtist from "./ModifiedArtist";

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
  public mb: SpotifyWebApi;

  public artists: ModifiedArtist[] = [];
  public MediaPaths: { [key: string]: string };

  constructor(dir: string, mb: SpotifyWebApi) {
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
    this.artists = JSON.parse(String(fs.readFileSync(this.MediaPaths.artists))) as ModifiedArtist[];
    this.scanArtistFolders();
  }

  writeData() {
    fs.writeFileSync(this.MediaPaths.artists, JSON.stringify(this.artists));
  }

  addArtist(data: ModifiedArtist) {
    if (this.artists.find((a) => a.id == data.id)) return;
    this.artists.push(data);
    this.scanArtistFolders();
    this.writeData();
  }

  scanArtistFolders() {
    this.artists.forEach((artist) => {
      let apath = `${this.location}/${filterName(artist.name)}`;
      try {
        fs.accessSync(apath);
      } catch (err) {
        fs.mkdirSync(apath);
      }
      artist.albums?.forEach((album) => {
        try {
          fs.accessSync(`${apath}/${filterName(album.name)}`);
        } catch (err) {
          fs.mkdirSync(`${apath}/${filterName(album.name)}`);
        }
      });
    });
  }
}

export default MediaManager;
