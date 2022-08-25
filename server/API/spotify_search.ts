import { constructArtist } from "../constructors";
import { APIRouter, Media, Spotify } from "../server";

APIRouter.create(
  "spotify_search",
  "POST",
  async (req) => {
    const query = req.body.term;
    if (!query || typeof query !== "string")
      return { err: true, message: "No search term provided." };

    try {
      const artists = await Spotify.api.searchArtists(query, {
        limit: 35,
      });
      return {
        err: false,
        list: artists.body.artists.items.map((a) => {
          const artist = constructArtist(a);
          artist.status = Media.hasArtist(artist.id) ? 2 : 0;
          return artist;
        }),
      };
    } catch (err) {
      console.error(err);
      return { err: true, message: "Failed to fetch from spotify" };
    }
  },
  true
);
