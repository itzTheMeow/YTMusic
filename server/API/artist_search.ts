import {
  constructArtistFromSoundCloud,
  constructArtistFromSpotify,
} from "../constructors";
import { searchKonamiArtists } from "../metadata/Konami";
import { searchSoundCloudArtists } from "../metadata/SoundCloud";
import { searchSpotifyArtists } from "../metadata/Spotify";
import { APIRouter, Media, SoundCloud, Spotify } from "../server";
import { MetadataProviders } from "../struct";

APIRouter.create(
  "artist_search",
  "POST",
  async (req) => {
    const query = req.body.term;
    if (!query || typeof query !== "string")
      return { err: true, message: "No search term provided." };

    try {
      switch (req.body.provider as MetadataProviders) {
        case MetadataProviders.Spotify:
          return { err: false, list: await searchSpotifyArtists(query) };
        case MetadataProviders.SoundCloud:
          return { err: false, list: await searchSoundCloudArtists(query) };
        case MetadataProviders.Konami:
          return { err: false, list: await searchKonamiArtists(query) };
        default:
          return { err: true, message: "Invalid provider specified." };
      }
    } catch (err) {
      console.error(err);
      return { err: true, message: "Failed to fetch artists." };
    }
  },
  true
);
