import fs from "fs";
import { join, basename } from "path";
import { Media } from "../server";
import { ArtistMeta } from "../struct";

Media.addEvent("LibraryScan", async (a) => {
  console.log("Scanning artist folders...");
  const artists = fs.readdirSync(Media.dir);
  const newData = [];
  artists.forEach((a) => {
    try {
      const path = join(Media.dir, a);
      const files = fs.readdirSync(path);
      if (!files.includes("artist.json")) return;
      const meta = JSON.parse(
        fs.readFileSync(join(path, "artist.json")).toString()
      ) as ArtistMeta;
      if (meta.version !== 1)
        return console.log(
          `Old Artist Format in '${a}' (${meta.version || 0}). Please update.`
        );
      newData.push(meta);

      meta.albums.forEach((alb) => {
        const path = Media.albumdir(meta, alb);
        if (fs.existsSync(path)) {
          const tracks = fs.readdirSync(path);
          alb.tracks.forEach((t) => {
            if (tracks.includes(basename(Media.trackdir(meta, alb, t))))
              t.added = true;
          });
        }
      });
    } catch {
      console.log(`Unrecognized Artist Folder: ${a}`);
    }
  });
  Media.artists = newData;
  console.log("Scan complete!");
});
