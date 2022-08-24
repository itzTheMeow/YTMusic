import { constructArtist } from "../constructors";
import { APIRouter, Spotify } from "../server";

APIRouter.create("spotify_search", "GET", async (req) => {
  const query = req.query.term;
  if (!query || typeof query !== "string") return [];

  try {
    const artists = await Spotify.api.searchArtists(query, {
      limit: 35,
    });
    return artists.body.artists.items.map((a) => {
      const artist = constructArtist(a);
      artist.status = 0;
      return artist;
    });
  } catch (err) {
    console.error(err);
    return [];
  }
});
