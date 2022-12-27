import { ulid } from "ulid";
import { Media, Spotify } from "../server";
import { Album, Artist, ExtendedArtist, MetadataProviders, Track } from "../struct";

export default async function getSpotifyArtist(id: string): Promise<ExtendedArtist> {
  const artist = (await Spotify.call(async () => await Spotify.api.getArtist(id)))?.body;
  if (!artist) return;
  const newArtist: ExtendedArtist = {
    ...constructArtistFromSpotify(artist),
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
            include_groups: "album,single,appears_on",
          })
        ).body.items
    );
    fullAlbums
      .filter((a) => a.album_type !== "compilation")
      .forEach((a) => {
        if (!newArtist.albums.find((l) => l.name == a.name))
          newArtist.albums.push(constructAlbumFromSpotify(a));
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
                await Spotify.api.getAlbumTracks(a.uuid, {
                  limit: 50,
                  offset: trackOffset,
                })
              ).body.items
          );
          songs.push(...albumSongs.filter((s) => s.artists.find((sa) => sa.id == artist.id)));
          if (albumSongs.length == 50) {
            trackOffset += 50;
            await newTrackSet(500);
          } else {
            a.tracks = songs.map(constructTrackFromSpotify);
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

export async function searchSpotifyArtists(query: string): Promise<Artist[]> {
  return (
    await Spotify.call(
      async () =>
        await Spotify.api.searchArtists(query, {
          limit: 15,
        })
    )
  ).body.artists.items.map((a) => {
    const artist = constructArtistFromSpotify(a);
    return { ...artist, status: Media.hasArtist(artist) ? 2 : 0 };
  });
}

function findImage(images: SpotifyApi.ImageObject[]) {
  return (images.find((i) => i.width == i.height) || images[0])?.url || "";
}

export function constructArtistFromSpotify(artist: SpotifyApi.ArtistObjectFull): Artist {
  return {
    id: ulid(),
    name: artist.name || "",
    url: artist.external_urls.spotify || "",
    genres: artist.genres || [],
    followers: artist.followers.total || 0,
    icon: findImage(artist.images),
    providers: {
      [MetadataProviders.Spotify]: artist.id,
    },
  };
}

export function constructAlbumFromSpotify(album: SpotifyApi.AlbumObjectSimplified): Album {
  return {
    type: (album.album_type as any) || "",
    url: album.external_urls.spotify || "",
    id: ulid(),
    name: album.name || "",
    year: Number(album.release_date.split("-")[0]) || 0,
    image: findImage(album.images),
    tracks: [],
    uuid: album.id || "",
    provider: MetadataProviders.Spotify,
  };
}

export function constructTrackFromSpotify(track: SpotifyApi.TrackObjectSimplified): Track {
  return {
    id: track.id,
    uuid: track.id,
    title: track.name || "",
    url: track.external_urls.spotify || "",
    number: track.track_number || 0,
    duration: track.duration_ms || 0,
    explicit: track.explicit || false,
  };
}
