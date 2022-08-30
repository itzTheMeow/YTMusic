import { DateTime } from "luxon";
import { Video } from "youtube-sr";
import {
  Album,
  Artist,
  Downloadable,
  MetadataProviders,
  MetadataProvidersList,
  Track,
} from "./struct";
import { SoundcloudTrackV2, SoundcloudUserV2 } from "soundcloud.ts";

function findImage(images: SpotifyApi.ImageObject[]) {
  return (images.find((i) => i.width == i.height) || images[0])?.url || "";
}

export function constructArtistFromSpotify(
  artist: SpotifyApi.ArtistObjectFull
): Artist {
  return {
    id: artist.id || "",
    name: artist.name || "",
    url: artist.external_urls.spotify || "",
    genres: artist.genres || [],
    followers: artist.followers.total || 0,
    icon: findImage(artist.images),
    providers: [MetadataProvidersList[MetadataProviders.Spotify]],
  };
}
export function constructArtistFromSoundCloud(
  artist: SoundcloudUserV2
): Artist {
  return {
    id: String(artist.id) || "",
    name: artist.username || "",
    url: artist.permalink_url || "",
    genres: [],
    followers: artist.followers_count || 0,
    icon: artist.avatar_url || "",
    providers: [MetadataProvidersList[MetadataProviders.SoundCloud]],
  };
}

export function constructAlbumFromSpotify(
  album: SpotifyApi.AlbumObjectSimplified
): Album {
  return {
    type: (album.album_type as any) || "",
    url: album.external_urls.spotify || "",
    id: album.id || "",
    name: album.name || "",
    year: Number(album.release_date.split("-")[0]) || 0,
    image: findImage(album.images),
    tracks: [],
    provider: MetadataProviders.Spotify,
  };
}
export function constructTrackFromSpotify(
  track: SpotifyApi.TrackObjectSimplified
): Track {
  return {
    id: track.id || "",
    title: track.name || "",
    url: track.external_urls.spotify || "",
    number: track.track_number || 0,
    duration: track.duration_ms || 0,
    explicit: track.explicit || false,
  };
}
export function constructTrackAlbumFromSoundCloud(
  track: SoundcloudTrackV2
): Album {
  return {
    type: "single",
    url: track.permalink_url || "",
    id: "alb" + track.id || "",
    name: track.title || "",
    year: new Date(track.created_at).getFullYear(),
    image: track.artwork_url?.replace("-large", "-t500x500") || "",
    tracks: [
      {
        id: String(track.id) || "",
        title: track.title || "",
        url: track.permalink_url || "",
        number: 1,
        duration: track.full_duration || track.duration || 0,
        explicit: false,
      },
    ],
    provider: MetadataProviders.SoundCloud,
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
