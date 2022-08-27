import sr from "youtube-sr";
import { constructVideoFromYouTube } from "../constructors";
import { Downloadable } from "../struct";
import { join } from "path";
import fs from "fs";
import { exec } from "youtube-dl-exec";
import { Media } from "../server";
import { sanitizeFileName } from "../MediaManager";

export async function searchYoutube(query: string): Promise<Downloadable[]> {
  try {
    const results = await sr.search(query, {
      type: "video",
    });
    return results.map(constructVideoFromYouTube);
  } catch {
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
