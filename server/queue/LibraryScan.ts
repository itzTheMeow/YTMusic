import { promises as fs } from "fs";
import { join, basename } from "path";
import { ulid } from "ulid";
import { Media } from "../server";
import { ArtistMeta, MetadataProviders } from "../struct";

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
        const artistjson = join(path, "artist.json"),
          meta = JSON.parse(
            (await fs.readFile(artistjson)).toString()
          ) as ArtistMeta,
          originalVersion = meta.version;
        if (meta.version !== 2)
          console.log(
            `Old Artist Format in '${a}' (v${
              meta.version || 0
            }). Attempting to migrate.`
          );
        // stuff to migrate old data to new
        if (meta.version <= 1) {
          // migrate from old providers array to new
          meta.providers = {
            [meta.providers?.[0] || MetadataProviders.Spotify]: meta.id,
          };
          // use new ID system
          meta.id = ulid();
          meta.albums.forEach((alb) => {
            // use new ID system
            alb.uuid = alb.id;
            alb.id = ulid();
            // use new provider IDs
            alb.provider = (() => {
              switch (<1 | 2 | 3>(<any>alb.provider)) {
                case 1:
                  return MetadataProviders.Spotify;
                case 2:
                  return MetadataProviders.SoundCloud;
                case 3:
                  return MetadataProviders.Konami;
                default:
                  return alb.provider || MetadataProviders.Spotify;
              }
            })();
            alb.tracks.forEach((trk) => {
              // use new ID system
              trk.uuid = trk.id;
              trk.id = ulid();
            });
          });
          meta.version++;
        }
        newData.push(meta);
        if (meta.version !== originalVersion) {
          await fs.writeFile(artistjson, JSON.stringify(meta));
          console.log(
            `Migrated data from v${originalVersion} => v${meta.version} for '${meta.name}'.`
          );
        }

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
              alb.tracks.forEach(
                (t) =>
                  (t.added = tracks.includes(
                    basename(Media.trackdir(meta, alb, t))
                  ))
              );
            } else alb.tracks.forEach((t) => (t.added = false));
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
