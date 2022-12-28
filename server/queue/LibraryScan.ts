import fs from "fs";
import { basename, join } from "path";
import { ulid } from "ulid";
import { isMainThread, parentPort, Worker } from "worker_threads";
import { Media } from "../server";
import { ArtistMeta, MetadataProviders } from "../struct";

interface WorkerPacket {
  type: "Log" | "Error" | "Data";
  data: any;
}

if (isMainThread) {
  Media.addEvent("LibraryScan", async (a) => {
    return await new Promise((res) => {
      console.log("Scanning artist folders...");
      const worker = new Worker(__filename);
      worker.on("message", (msg: WorkerPacket) => {
        switch (msg.type) {
          case "Log":
            console.log(msg.data);
            break;
          case "Error":
            console.error(msg.data);
            break;
          case "Data":
            Media.artists = msg.data;
            break;
        }
      });
      worker.on("exit", () => {
        console.log("Scan complete!");
        res(void 0);
      });
    });
  });
} else {
  function post(packet: WorkerPacket) {
    parentPort.postMessage(packet);
  }

  const artists = fs.readdirSync(Media.dir);
  const newData = [];
  artists.map((a) => {
    try {
      const path = join(Media.dir, a);
      const files = fs.readdirSync(path);
      if (!files.includes("artist.json"))
        return post({ type: "Log", data: `No valid artist in '${a}'.` });
      const artistjson = join(path, "artist.json"),
        meta = JSON.parse(fs.readFileSync(artistjson).toString()) as ArtistMeta,
        originalVersion = meta.version;
      if (meta.version !== 2)
        post({
          type: "Log",
          data: `Old Artist Format in '${a}' (v${meta.version || 0}). Attempting to migrate.`,
        });
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
        fs.writeFileSync(artistjson, JSON.stringify(meta));
        post({
          type: "Log",
          data: `Migrated data from v${originalVersion} => v${meta.version} for '${meta.name}'.`,
        });
      }

      meta.albums.forEach((alb) => {
        const path = Media.albumdir(meta, alb);
        if (fs.existsSync(path)) {
          const tracks = fs.readdirSync(path);
          alb.tracks.forEach(
            (t) => (t.added = tracks.includes(basename(Media.trackdir(meta, alb, t))))
          );
        } else alb.tracks.forEach((t) => (t.added = false));
      });
    } catch (err) {
      post({ type: "Log", data: `Unrecognized Artist Folder: ${a}` });
      post({ type: "Error", data: err });
    }
  });
  post({ type: "Data", data: newData });
}
