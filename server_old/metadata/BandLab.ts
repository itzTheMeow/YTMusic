import axios from "axios";
import { ulid } from "ulid";
import { Album, ExtendedArtist, MetadataProviders } from "../struct";

export default async function getBandLabArtist(id: string): Promise<ExtendedArtist> {
  const bartist: BandLabArtist = (await axios.get(`${API}/users/${id}`)).data;

  const albumList = await rollingRequest<BandLabAlbumOverview>(
    `${API}/users/${bartist.id}/albums?limit=100&state=Released`
  );
  const albums = (<BandLabAlbum[]>(
    await Promise.all(albumList.map(async (a) => (await axios.get(`${API}/albums/${a.id}`)).data))
  )).map(constructTrackAlbumFromBandLab);
  const tracks = await rollingRequest<BandLabPost>(
    `${API}/users/${bartist.id}/track-posts?limit=100`
  );

  return {
    ...constructArtistFromBandLab(bartist),
    albums: [
      ...albums,
      ...tracks
        .filter((p) => !albums.find((a) => a.tracks.find((t) => t.uuid == p.id)))
        .map(constructPostTrackFromBandLab),
    ],
  };
}

export function constructTrackAlbumFromBandLab(album: BandLabAlbum): Album {
  return {
    id: ulid(),
    uuid: album.id,
    type: "album",
    name: album.name,
    url: `https://bandlab.com/${album.artist.username}/albums/${album.id}`,
    image: album.picture.m,
    year: Number(album.releaseDate.split("-")[0]) || new Date().getFullYear(),
    provider: MetadataProviders.BandLab,
    tracks: album.tracks.map((track, i) => ({
      id: ulid(),
      title: track.name,
      uuid: track.id,
      explicit: track.isExplicit,
      url: `https://bandlab.com/post/${track.id}`,
      number: i + 1,
      duration: Math.floor(track.duration * 1000),
    })),
  };
}
export function constructPostTrackFromBandLab(post: BandLabPost): Album {
  return {
    id: ulid(),
    uuid: post.id,
    type: "single",
    name: post.track.name,
    url: `https://bandlab.com/post/${post.id}`,
    image: post.track.picture.m,
    year: Number(post.createdOn.split("-")[0]) || new Date().getFullYear(),
    provider: MetadataProviders.BandLab,
    tracks: [
      {
        id: ulid(),
        title: post.track.name,
        uuid: post.id,
        explicit: post.isExplicit,
        url: `https://bandlab.com/post/${post.id}`,
        number: 1,
        duration: Math.floor(post.track.sample.duration * 1000),
      },
    ],
  };
}
