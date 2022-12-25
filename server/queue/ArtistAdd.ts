import fs from "fs";
import { join } from "path";
import getKonamiArtist from "../metadata/Konami";
import getSoundCloudArtist from "../metadata/SoundCloud";
import getSpotifyArtist from "../metadata/Spotify";
import { Media } from "../server";
import { ArtistMeta, MetadataProviders } from "../struct";

Media.addEvent("ArtistAdd", async (event) => {
  try {
    const artist = await (() => {
      switch (event.provider) {
        case MetadataProviders.Spotify:
          return getSpotifyArtist;
        case MetadataProviders.SoundCloud:
          return getSoundCloudArtist;
        case MetadataProviders.Konami:
          return getKonamiArtist;
      }
    })()(event.id);
    const existingArtist = Media.artists.find((a) => a.name == artist.name);
    const meta: ArtistMeta = {
      version: 2,
      ...(existingArtist
        ? {
            ...existingArtist,
            albums: [
              ...existingArtist.albums.filter(
                (l) => l.provider !== event.provider
              ),
              ...artist.albums.filter(
                (l) =>
                  !existingArtist.albums
                    .filter((a) => a.provider !== event.provider)
                    .find((a) => a.name == l.name)
              ),
            ],
            providers: {
              ...existingArtist.providers,
              ...artist.providers,
            },
          }
        : artist),
    };
    fs.writeFileSync(
      join(Media.artistdir(artist), "artist.json"),
      JSON.stringify(meta)
    );
    if (existingArtist)
      Media.artists.splice(Media.artists.indexOf(existingArtist), 1);
    Media.artists.push(meta);
    Media.queueAction({ type: "LibraryScan" });
  } catch (err) {
    console.error(err);
  }
});
