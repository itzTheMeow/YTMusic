import ffmeta from "ffmetadata";
import ffmpegbin from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { image } from "image-downloader";
import { Media } from "../server";
import { downloadSoundcloud } from "../sound/SoundCloud";
import { downloadYoutube } from "../sound/YouTube";
import { SoundProviders } from "../struct";

Media.addEvent("SongDownload", async (event) => {
  const { artist, album, track } = event;

  const filePath = await (async () => {
    switch (event.provider) {
      case SoundProviders.YouTube:
        return await downloadYoutube(event.url);
      case SoundProviders.SoundCloud:
        return await downloadSoundcloud(event.url);
    }
  })();
  if (typeof filePath !== "string") return console.error(filePath.err);
  if (!fs.existsSync(filePath)) return console.error("File for conversion not found " + filePath);

  Media.createdir(Media.albumdir(artist, album));
  const trackPath = Media.trackdir(artist, album, track);
  await new Promise((r) =>
    ffmpeg()
      .setFfmpegPath(ffmpegbin)
      .input(filePath)
      .noVideo()
      .audioBitrate(128)
      .save(trackPath)
      .on("end", r)
  );

  const cover = (
    await image({
      url: album.image,
      dest: Media.tempdir(),
    })
  ).filename;

  ffmeta.setFfmpegPath(ffmpegbin);
  await new Promise((r) =>
    ffmeta.write(
      trackPath,
      {
        artist: artist.name,
        album: album.name,
        title: track.title,
        track: `${track.number}/${album.tracks.length}`,
        date: album.year,
      },
      {
        attachments: [cover],
        id3v1: true,
        "id3v2.3": true,
      },
      r
    )
  );

  fs.rmSync(cover);
  fs.rmSync(filePath);
  Media.queueAction({ type: "LibraryScan" });
});
