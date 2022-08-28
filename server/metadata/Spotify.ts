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
    const fullAlbums = await Spotify.call(
      async () =>
        (
          await Spotify.api.getArtistAlbums(artist.id, {
            limit: 50,
            offset: albumOffset,
          })
        ).body.items
    );
    fullAlbums
      .filter(
        (a) =>
          a.album_type !== "compilation" &&
          a.artists.find((a) => a.id == artist.id)
      )
      .forEach((a) => {
        if (!newArtist.albums.find((l) => l.name == a.name))
          newArtist.albums.push(constructAlbum(a));
      });
    if (fullAlbums.length == 50) {
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
          const albumSongs = await Spotify.call(
            async () =>
              (
                await Spotify.api.getAlbumTracks(a.id, {
                  limit: 50,
                  offset: trackOffset,
                })
              ).body.items
          );
          songs.push(
            ...albumSongs.filter((s) =>
              s.artists.find((sa) => sa.id == newArtist.id)
            )
          );
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

  // attempts to sort out singles that are separate from their albums
  /*newArtist.albums
    .filter(
      (a) =>
        a.type == "single" &&
        a.tracks.length == 1 &&
        a.tracks[0].title == a.name
    )
    .forEach((a) => {
      if (
        newArtist.albums.find(
          (l) =>
            l !== a &&
            l.tracks.find(
              (t) => t.title == a.name && t.duration == a.tracks[0].duration
            )
        )
      )
        newArtist.albums.splice(newArtist.albums.indexOf(a), 1);
    });*/

  newArtist.albums = newArtist.albums.filter((a) => a.tracks.length);

  return newArtist;
}
