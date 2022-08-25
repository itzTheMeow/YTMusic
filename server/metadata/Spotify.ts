import {
  constructAlbum,
  constructArtist,
  constructTrack,
} from "../constructors";
import { Spotify } from "../server";
import { ExtendedArtist } from "../struct";

export default async function getSpotifyArtist(
  id: string
): Promise<ExtendedArtist> {
  const artist = (await Spotify.api.getArtist(id)).body;
  const newArtist: ExtendedArtist = {
    ...constructArtist(artist),
    albums: [],
  };
  let albumOffset = 0;
  await (async function newAlbumSet() {
    const artistAlbums = (
      await Spotify.api.getArtistAlbums(artist.id, {
        limit: 50,
        offset: albumOffset,
      })
    ).body.items;
    artistAlbums.map((a) => {
      // tries its best to filter out unrelated
      if (
        a.album_type == "compilation" ||
        !a.artists.map((a) => a.id).includes(artist.id)
      )
        return;
      newArtist.albums.push(constructAlbum(a));
    });
    if (artistAlbums.length == 50) {
      albumOffset += 50;
      await newAlbumSet();
    }
  })();

  await Promise.all(
    newArtist.albums.map(async (a) => {
      let trackOffset = 0;
      const songs: SpotifyApi.TrackObjectSimplified[] = [];
      await (async function newTrackSet(time: number) {
        await new Promise((r) => setTimeout(r, time));
        try {
          const albumSongs = (
            await Spotify.api.getAlbumTracks(a.id, {
              limit: 50,
              offset: trackOffset,
            })
          ).body.items;
          songs.push(...albumSongs);
          if (albumSongs.length == 50) {
            trackOffset += 50;
            await newTrackSet(500);
          } else {
            a.tracks = songs.map(constructTrack);
          }
        } catch {
          await newTrackSet(1000);
        }
      })(1);
    })
  );

  return newArtist;
}
