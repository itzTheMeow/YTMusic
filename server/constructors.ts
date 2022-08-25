import { Album, Artist, Track } from "./struct";

function findImage(images: SpotifyApi.ImageObject[]) {
  return (images.find((i) => i.width == i.height) || images[0])?.url || "";
}

export function constructArtist(artist: SpotifyApi.ArtistObjectFull): Artist {
  return {
    id: artist.id || "",
    name: artist.name || "",
    url: artist.external_urls.spotify || "",
    genres: artist.genres || [],
    followers: artist.followers.total || 0,
    icon: findImage(artist.images),
  };
}
export function constructAlbum(album: SpotifyApi.AlbumObjectSimplified): Album {
  return {
    type: (album.album_type as any) || "",
    url: album.external_urls.spotify || "",
    id: album.id || "",
    name: album.name || "",
    year: Number(album.release_date.split("-")[0]) || 0,
    image: findImage(album.images),
    tracks: [],
  };
}
export function constructTrack(track: SpotifyApi.TrackObjectSimplified): Track {
  return {
    title: track.name || "",
    url: track.external_urls.spotify || "",
    number: track.track_number || 0,
    duration: track.duration_ms || 0,
    explicit: track.explicit || false,
  };
}
