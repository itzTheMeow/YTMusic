import { DateTime } from "luxon";
import { Video } from "youtube-sr";
import { Album, Artist, Downloadable, Track } from "./struct";

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
    id: track.id || "",
    title: track.name || "",
    url: track.external_urls.spotify || "",
    number: track.track_number || 0,
    duration: track.duration_ms || 0,
    explicit: track.explicit || false,
  };
}

export function constructVideoFromYouTube(vid: Video): Downloadable {
  return {
    title: vid.title || "",
    duration: vid.duration || 0,
    uploadedAt: vid.uploadedAt
      ? DateTime.now()
          .minus({
            [vid.uploadedAt.split(" ")[1]]: Number(
              vid.uploadedAt.split(" ")[0]
            ),
          })
          .minus({ minute: 1 }) // fixes the time
          .toMillis()
      : Date.now(),
    views: vid.views || 0,
    thumbnail: vid.thumbnail?.url || "",
    author: {
      name: vid.channel?.name || "",
      icon: vid.channel?.iconURL() || "",
      url: vid.channel?.url || "",
    },
    url: vid.url || "",
    embed: vid.embedURL || "",
  };
}
