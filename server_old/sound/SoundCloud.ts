import fs from "fs";
import { join } from "path";
import { SoundcloudTrackV2 } from "soundcloud.ts";
import { exec } from "youtube-dl-exec";
import { sanitizeFileName } from "../MediaManager";
import { Media, SoundCloud } from "../server";
import { Downloadable } from "../struct";

export async function searchSoundCloud(query: string): Promise<Downloadable[]> {
  try {
    const results =
      (await SoundCloud.api.tracks.searchV2({ q: query, limit: 30 }))?.collection.filter(
        (a) => a
      ) || [];
    return results.map(constructVideoFromSoundCloud);
  } catch (err) {
    console.error(`Error searching soundcloud: ${err}\nQuery: '${query}'\n${err.stack}`);
    return [];
  }
}

export async function downloadSoundcloud(url: string): Promise<{ err: string } | string> {
  return new Promise(async (res) => {
    try {
      const path = join(Media.tempdir(), `${sanitizeFileName(url)}.mp3`);
      const file = fs.createWriteStream(path);
      const stream = exec(url, {
        format: "bestaudio",
        output: "-",
      });
      stream.stdout.pipe(file);
      file.on("error", (err) => {
        res({ err: String(err) });
      });
      file.on("finish", () => {
        res(path);
      });
    } catch (err) {
      res({ err });
    }
  });
}

export function constructVideoFromSoundCloud(track: SoundcloudTrackV2): Downloadable {
  return {
    title: track.title || "",
    duration: track.full_duration || track.duration || 0,
    uploadedAt: new Date(track.created_at).getTime(),
    views: track.playback_count || 0,
    thumbnail: track.artwork_url || track.user.avatar_url || "",
    author: {
      name: track.user.username || "",
      icon: track.user.avatar_url || "",
      url: track.user.permalink_url || "",
    },
    url: track.permalink_url || "",
    embed: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${track.id}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`,
  };
}
