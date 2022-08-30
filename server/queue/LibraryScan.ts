import { promises as fs } from "fs";
import { join, basename } from "path";
import { Media } from "../server";
import {
  ArtistMeta,
  MetadataProviders,
  MetadataProvidersList,
} from "../struct";

Media.addEvent("LibraryScan", async (a) => {
  console.log("Scanning artist folders...");
  const artists = await fs.readdir(Media.dir);
  const newData = [];
  await Promise.all(
    artists.map(async (a) => {
      try {
        const path = join(Media.dir, a);
        const files = await fs.readdir(path);
        if (!files.includes("artist.json"))
          return console.log(`No valid artist in '${a}'.`);
        const meta = JSON.parse(
          (await fs.readFile(join(path, "artist.json"))).toString()
        ) as ArtistMeta;
        if (meta.version !== 1)
          return console.log(
            `Old Artist Format in '${a}' (${meta.version || 0}). Please update.`
          );
        // stuff to migrate old data to new
        meta.providers = meta.providers || [
          MetadataProvidersList[MetadataProviders.Spotify],
        ];
        meta.albums.forEach(
          //@ts-ignore
          (l) =>
            typeof l.provider !== "string" &&
            (l.provider = MetadataProvidersList[MetadataProviders.Spotify])
        );
        newData.push(meta);

        await Promise.all(
          meta.albums.map(async (alb) => {
            const path = Media.albumdir(meta, alb);
            if (
              await (async () => {
                try {
                  return await fs.stat(path);
                } catch {
                  return false;
                }
              })()
            ) {
              const tracks = await fs.readdir(path);
              alb.tracks.forEach((t) => {
                if (tracks.includes(basename(Media.trackdir(meta, alb, t))))
                  t.added = true;
              });
            }
          })
        );
      } catch (err) {
        console.log(`Unrecognized Artist Folder: ${a}`);
        console.error(err);
      }
    })
  );
  Media.artists = newData;
  console.log("Scan complete!");
});
