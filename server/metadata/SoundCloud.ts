import { SoundcloudTrackV2, SoundcloudUserV2 } from "soundcloud.ts";
import { ulid } from "ulid";
import { Media, SoundCloud } from "../server";
import { Album, Artist, ExtendedArtist, MetadataProviders } from "../struct";

export default async function getSoundCloudArtist(id: string): Promise<ExtendedArtist> {
  const user = await SoundCloud.api.users.getV2(id);
  const tracks = await SoundCloud.api.users.tracksV2(user.id);

  return {
    ...constructArtistFromSoundCloud(user),
    albums: tracks.map(constructTrackAlbumFromSoundCloud),
  };
}

export async function searchSoundCloudArtists(query: string): Promise<Artist[]> {
  return (await SoundCloud.api.users.searchV2({ q: query, limit: 12 })).collection
    .filter((a) => a)
    .map((a) => {
      const artist = constructArtistFromSoundCloud(a);
      return { ...artist, status: Media.hasArtist(artist) ? 2 : 0 };
    });
}

export function constructArtistFromSoundCloud(artist: SoundcloudUserV2): Artist {
  return {
    id: ulid(),
    name: artist.username || "",
    url: artist.permalink_url || "",
    genres: [],
    followers: artist.followers_count || 0,
    icon: artist.avatar_url || "",
    providers: {
      [MetadataProviders.SoundCloud]: String(artist.id || ""),
    },
  };
}

export function constructTrackAlbumFromSoundCloud(track: SoundcloudTrackV2): Album {
  return {
    type: "single",
    url: track.permalink_url || "",
    id: ulid(),
    name: track.title || "",
    year: new Date(track.created_at).getFullYear(),
    image: (track.artwork_url || track.user.avatar_url)?.replace("-large", "-t500x500") || "",
    uuid: "alb" + track.id,
    tracks: [
      {
        id: ulid(),
        uuid: String(track.id) || "",
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
