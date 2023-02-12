import fs from "fs";
import { Media } from "../server";

Media.addEvent("ArtistDelete", async (event) => {
  const artist = Media.artists.find((a) => a.id == event.id);
  if (artist) {
    Media.artists.splice(Media.artists.indexOf(artist), 1);
    fs.rmSync(Media.artistdir(artist), { recursive: true, force: true });
  }
  Media.queueAction({ type: "LibraryScan" });
});
