import {
  constructArtistFromSoundCloud,
  constructArtistFromSpotify,
} from "../constructors";
import { APIRouter, Media, SoundCloud, Spotify } from "../server";

APIRouter.create(
  "artist_search",
  "POST",
  async (req) => {
    const query = req.body.term;
    if (!query || typeof query !== "string")
      return { err: true, message: "No search term provided." };
    const artists = [];

    try {
      (
        await Spotify.call(
          async () =>
            await Spotify.api.searchArtists(query, {
              limit: 15,
            })
        )
      ).body.artists.items.forEach((a) => {
        const artist = constructArtistFromSpotify(a);
        artists.push({ ...artist, status: Media.hasArtist(artist) ? 2 : 0 });
      });
      (
        await SoundCloud.api.users.searchV2({ q: query, limit: 5 })
      ).collection.forEach((a) => {
        if (!a) return;
        const artist = constructArtistFromSoundCloud(a);
        artists.push({ ...artist, status: Media.hasArtist(artist) ? 2 : 0 });
      });
    } catch (err) {
      console.error(err);
      return { err: true, message: "Failed to fetch artists." };
    }

    return {
      err: false,
      list: artists,
    };
  },
  true
);
