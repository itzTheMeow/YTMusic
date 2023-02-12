import fs from "fs";
import { Media } from "../server";

Media.addEvent("SongDelete", (event) => {
  try {
    fs.rmSync(Media.trackdir(event.artist, event.album, event.track));
    const a = Media.albumdir(event.artist, event.album);
    if (!fs.readdirSync(a).length) fs.rmSync(a, { recursive: true });
  } catch {}
  Media.queueAction({ type: "LibraryScan" });
});
