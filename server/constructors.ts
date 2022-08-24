import { Artist } from "./struct";

export function constructArtist(artist: SpotifyApi.ArtistObjectFull): Artist {
  return {
    id: artist.id,
    name: artist.name,
    url: artist.external_urls.spotify,
    genres: artist.genres,
    followers: artist.followers.total,
    icon: (artist.images.find((i) => i.width == i.height) || artist.images[0])?.url || "",
  };
}
