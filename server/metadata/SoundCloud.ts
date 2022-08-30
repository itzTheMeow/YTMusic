import {
  constructArtistFromSoundCloud,
  constructTrackAlbumFromSoundCloud,
} from "../constructors";
import { SoundCloud } from "../server";
import { ExtendedArtist } from "../struct";

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
