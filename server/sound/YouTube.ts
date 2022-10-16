import sr, { Video } from "youtube-sr";
import { Downloadable } from "../struct";
import { join } from "path";
import fs from "fs";
import { exec } from "youtube-dl-exec";
import { Media } from "../server";
import { sanitizeFileName } from "../MediaManager";
import { DateTime } from "luxon";

export async function searchYoutube(query: string): Promise<Downloadable[]> {
  try {
    const results =
      (await sr.search(query, {
        type: "video",
      })) || [];
    return results.map(constructVideoFromYouTube);
  } catch (err) {
    console.error(
      `Error searching youtube: ${err}\nQuery: '${query}'\n${err.stack}`
    );
    return [];
  }
}

export async function downloadYoutube(
  url: string
): Promise<{ err: string } | string> {
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
  if (!Number(vid.uploadedAt[0]))
    vid.uploadedAt = vid.uploadedAt.split(" ").slice(1).join(" ");
  return {
    title: vid.title || "",
    duration: vid.duration || 0,
    uploadedAt: vid.uploadedAt
      ? DateTime.now()
          .minus({
            [vid.uploadedAt.split(" ")[1]]: Number(
              vid.uploadedAt.split(" ")[0]
            ),
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
