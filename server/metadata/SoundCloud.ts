import {
  constructArtistFromSoundCloud,
  constructTrackAlbumFromSoundCloud,
} from "../constructors";
import { Media, SoundCloud } from "../server";
import { Artist, ExtendedArtist } from "../struct";

export default async function getSoundCloudArtist(
  id: string
): Promise<ExtendedArtist> {
  const user = await SoundCloud.api.users.getV2(id);
  const tracks = await SoundCloud.api.users.tracksV2(user.id);

  return {
    ...constructArtistFromSoundCloud(user),
    albums: tracks.map(constructTrackAlbumFromSoundCloud),
  };
}

export async function searchSoundCloudArtists(
  query: string
): Promise<Artist[]> {
  return (
    await SoundCloud.api.users.searchV2({ q: query, limit: 12 })
  ).collection
    .filter((a) => a)
    .map((a) => {
      const artist = constructArtistFromSoundCloud(a);
      return { ...artist, status: Media.hasArtist(artist) ? 2 : 0 };
    });
}
