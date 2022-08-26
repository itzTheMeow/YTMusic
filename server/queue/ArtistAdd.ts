import fs from "fs";
import { join } from "path";
import getSpotifyArtist from "../metadata/Spotify";
import { Media } from "../server";
import { ArtistMeta, MetadataProviders } from "../struct";

Media.addEvent("ArtistAdd", async (event) => {
  try {
    const artist = await (() => {
      switch (event.provider) {
        case MetadataProviders.Spotify:
          return getSpotifyArtist;
      }
    })()(event.id);
    const meta: ArtistMeta = {
      version: 1,
      ...artist,
    };
    fs.writeFileSync(
      join(Media.artistdir(artist), "artist.json"),
      JSON.stringify(meta)
    );
    Media.artists.push(meta);
    Media.queueAction({ type: "LibraryScan" });
  } catch (err) {
    console.error(err);
  }
});
