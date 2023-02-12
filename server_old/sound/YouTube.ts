import fs from "fs";
import { DateTime } from "luxon";
import { join } from "path";
import { exec } from "youtube-dl-exec";
import sr, { Video } from "youtube-sr";
import { sanitizeFileName } from "../MediaManager";
import { Media } from "../server";
import { Downloadable } from "../struct";

export async function searchYoutube(query: string): Promise<Downloadable[]> {
  try {
    if (sr.validate(query, "VIDEO") || sr.validate(query, "VIDEO_ID")) {
      const vid = await sr.getVideo(query);
      if (vid) return [constructVideoFromYouTube(vid)];
    }
    const results =
      (await sr.search(query, {
        type: "video",
        limit: 30,
      })) || [];
    return results.map(constructVideoFromYouTube);
  } catch (err) {
    console.error(`Error searching youtube: ${err}\nQuery: '${query}'\n${err.stack}`);
    return [];
  }
}

export async function downloadYoutube(url: string): Promise<{ err: string } | string> {
  return new Promise(async (res) => {
    try {
      const path = join(Media.tempdir(), `${sanitizeFileName(url)}.mp4`);
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

export function constructVideoFromYouTube(vid: Video): Downloadable {
  if (vid.uploadedAt && !Number(vid.uploadedAt[0]))
    vid.uploadedAt = vid.uploadedAt.split(" ").slice(1).join(" ");
  return {
    title: vid.title || "",
    duration: vid.duration || 0,
    uploadedAt: vid.uploadedAt
      ? DateTime.now()
          .minus({
            [vid.uploadedAt.split(" ")[1]]: Number(vid.uploadedAt.split(" ")[0]),
          })
          .minus({ minute: 1 }) // fixes the time
          .toMillis()
      : Date.now(),
    views: vid.views || 0,
    thumbnail: vid.thumbnail?.url || "",
    author: {
      name: vid.channel?.name || "",
      icon: vid.channel?.iconURL() || "",
      url: vid.channel?.url || "",
    },
    url: vid.url || "",
    embed: vid.embedURL || "",
  };
}
