import ModifiedArtist from "./ModifiedArtist";
import { spapi } from "./server";

async function GetArtist(id: string): Promise<ModifiedArtist> {
  return new Promise(async (res) => {
    let newArtist: ModifiedArtist;
    let artist = (await spapi.getArtist(id)).body;
    newArtist = artist;
    newArtist.albums = [];
    new Promise((res2) => {
      let albumOffset = 0;
      async function newAlbumSet() {
        let artistAlbums = (
          await spapi.getArtistAlbums(artist.id, { limit: 50, offset: albumOffset })
        ).body.items;
        artistAlbums.map((a) => {
          newArtist.albums?.push(a);
        });
        if (artistAlbums.length == 50) {
          albumOffset += 50;
          newAlbumSet();
        } else {
          res2(void 0);
        }
      }
      newAlbumSet();
    }).then(() => {
      new Promise((res2) => {
        let albumsDone = 0;
        newArtist.albums?.forEach(async (a) => {
          new Promise((res3) => {
            let trackOffset = 0;
            let songs: SpotifyApi.TrackObjectSimplified[] = [];
            async function newTrackSet() {
              let albumSongs = (
                await spapi.getAlbumTracks(a.id, { limit: 50, offset: trackOffset })
              ).body.items;
              albumSongs.map((s) => {
                songs.push(s);
              });
              if (albumSongs.length == 50) {
                trackOffset += 50;
                newTrackSet();
              } else {
                res3(songs);
              }
            }
            newTrackSet();
          }).then((albumSongs) => {
            albumsDone++;
            if (!newArtist.albums) return;
            newArtist.albums[newArtist.albums.indexOf(a)].songs =
              albumSongs as SpotifyApi.TrackObjectSimplified[];
            if (albumsDone >= newArtist.albums.length) res2(void 0);
          });
        });
      }).then(() => {
        res(newArtist);
      });
    });
  });
}
export default GetArtist;
