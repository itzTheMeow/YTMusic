import fs from "fs";
import SpotifyWebApi from "spotify-web-api-node";
import ytdl from "ytdl-core";
import { ModifiedAlbum, ModifiedArtist } from "./ModifiedArtist";
import ffmpeg from "ffmpeg-static";
import { MediaOptions, MediaTags } from "./MediaTags";
import path from "path";
import fffmpeg from "fluent-ffmpeg";

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
  public ffmpeg: any = require("ffmetadata");

  public artists: ModifiedArtist[] = [];
  public songExists: { [key: string]: string[] } = {};
  public MediaPaths: { [key: string]: string };

  constructor(dir: string, mb: SpotifyWebApi) {
    this.location = dir;
    this.mb = mb;
    this.MediaPaths = {
      artists: `${this.location}/artists.json`,
      songs: `/songs.json`,
    };
    this.ffmpeg.setFfmpegPath(ffmpeg);

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
  remArtist(id: string) {
    let artist = this.artists.find((a) => a.id == id);
    if (!artist) return;
    fs.rmSync(`${this.location}/${filterName(artist.name)}`, { recursive: true });
    this.artists = this.artists.filter((a) => a.id !== id);
    this.writeData();
    this.scanArtistFolders();
  }

  songPath(artist: ModifiedArtist, album: ModifiedAlbum, song: SpotifyApi.TrackObjectSimplified) {
    return path.join(
      this.location,
      filterName(artist.name),
      filterName(album.name),
      ("0" + song.track_number).slice(-2) + " - " + filterName(song.name) + ".mp3"
    );
  }

  downloadSong(
    id: string,
    artist: ModifiedArtist,
    album: ModifiedAlbum,
    song: SpotifyApi.TrackObjectSimplified
  ) {
    return new Promise((res, rej) => {
      let mp3 = this.songPath(artist, album, song);
      let scan = this.scanArtistFolders.bind(this);

      try {
        let downloadStream = ytdl(`https://youtube.com/watch?v=${id}`, {
          filter: "audioonly",
          quality: "highestaudio",
        }).on("error", () => {
          rej("ytdl error");
        });

        fffmpeg(downloadStream)
          .setFfmpegPath(ffmpeg)
          .audioBitrate(128)
          .save(mp3)
          .on("end", () => {
            console.log("written stream");
            require("image-downloader")
              .image({
                url: album.images[0].url,
                dest: path.join(__dirname, ".."),
              })
              .then((img: any) => {
                img = img.filename;
                let tags: MediaTags = {
                  artist: artist.name,
                  album: album.name,
                  title: song.name,
                  track: `${song.track_number}/${album.songs?.length || 0}`,
                  date:
                    album.release_date_precision == "year"
                      ? Number(album.release_date)
                      : new Date(album.release_date).getFullYear(),
                };
                let opts: MediaOptions = {
                  attachments: [img],
                  id3v1: true,
                  "id3v2.3": true,
                };

                this.ffmpeg.write(mp3, tags, opts, function (err: any) {
                  fs.unlinkSync(img);
                  if (err) rej("tagging err: " + err);
                  else {
                    scan();
                    res(void 0);
                  }
                });
              })
              .catch((e: any) => {
                rej("img err: " + e);
              });
          })
          .on("error", (err) => {
            rej("conversion err: " + err.message);
          });
      } catch (e) {
        return rej("general err: " + e);
      }
    });
  }

  scanArtistFolders() {
    console.log("scanning artist folders");
    this.artists.forEach((artist) => {
      let apath = `${this.location}/${filterName(artist.name)}`;
      try {
        fs.accessSync(apath);
      } catch (err) {
        fs.mkdirSync(apath);
      }
      this.songExists[artist.id] = [];
      artist.albums?.forEach((album) => {
        let albumPath = `${apath}/${filterName(album.name)}`;
        try {
          fs.accessSync(albumPath);
        } catch (err) {
          fs.mkdirSync(albumPath);
        }
        album.songs?.forEach((s) => {
          if (fs.existsSync(this.songPath(artist, album, s))) {
            this.songExists[artist.id].push(s.id);
          }
        });
      });
    });
  }
}

export default MediaManager;
