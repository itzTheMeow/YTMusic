import axios from "axios";
import { ulid } from "ulid";
import { AuthTokens, Media } from "../server";
import { Album, Artist, ExtendedArtist, MetadataProviders } from "../struct";

interface BandLabResponse<d = any> {
  data: d;
  paging: {
    cursors: {
      after: string | null;
    };
  };
}
interface BandLabPicture {
  l: string;
  m: string;
  s: string;
  url: string;
  xs: string;
}
interface BandLabArtist {
  about: string;
  counters: {
    bands: number;
    collections: number;
    followers: number;
    following: number;
    plays: number;
  };
  createdOn: string;
  genres: {
    id: string;
    name: string;
  }[];
  id: string;
  name: string;
  picture: BandLabPicture;
  skills: {
    id: string;
    name: string;
  }[];
  username: string;
}
interface BandLabAlbumOverview {
  id: string;
  name: string;
  picture: BandLabPicture;
  releaseDate: string; // format: YYYY-MM-DD
  type: "Album";
}
interface BandLabAlbum extends BandLabAlbumOverview {
  artist: BandLabArtist;
  description: string;
  tracks: {
    audioUrl: string;
    duration: number;
    id: string;
    isExplicit: boolean;
    name: string;
  }[];
}
interface BandLabPost {
  createdOn: string; // format: YYYY-MM-DDT:Z";
  creator: BandLabArtist;
  id: string;
  isExplicit: boolean;
  track: {
    name: string;
    picture: BandLabPicture;
    sample: {
      audioFormat: string;
      audioUrl: string;
      duration: number;
    };
  };
  type: "Track";
}

const API = "https://bandlab.com/api/v1.3";
async function rollingRequest<T>(url: string): Promise<T[]> {
  const data: T[] = [];
  let cursor: string | null = null;
  while (true) {
    try {
      const res = <BandLabResponse<T[]>>(
        (await axios.get(url + (cursor ? `&after=${cursor}` : ""))).data
      );
      data.push(...res.data);
      cursor = res.paging.cursors.after;
      if (!cursor) break;
    } catch (err) {
      console.error(err);
      break;
    }
  }
  return data;
}

export default async function getBandLabArtist(
  id: string
): Promise<ExtendedArtist> {
  const bartist: BandLabArtist = (await axios.get(`${API}/users/${id}`)).data;

  const albumList = await rollingRequest<BandLabAlbumOverview>(
    `${API}/users/${bartist.id}/albums?limit=100&state=Released`
  );
  const albums = (<BandLabAlbum[]>(
    await Promise.all(
      albumList.map(
        async (a) => (await axios.get(`${API}/albums/${a.id}`)).data
      )
    )
  )).map(constructTrackAlbumFromBandLab);
  const tracks = await rollingRequest<BandLabPost>(
    `${API}/users/${bartist.id}/track-posts?limit=100`
  );

  return {
    ...constructArtistFromBandLab(bartist),
    albums: [
      ...albums,
      ...tracks
        .filter(
          (p) => !albums.find((a) => a.tracks.find((t) => t.uuid == p.id))
        )
        .map(constructPostTrackFromBandLab),
    ],
  };
}

export async function searchBandLabArtists(query: string): Promise<Artist[]> {
  const res = <BandLabArtist[]>(
    await axios.get(
      `${API}/search/users?limit=12&query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${AuthTokens.bandlab}`,
          "X-Client-Id": "BandLab-Web",
          "X-Client-Version": "10.0.342",
        },
      }
    )
  ).data?.data;
  if (!res) return [];
  return res.map((a) => {
    const artist = constructArtistFromBandLab(a);
    return { ...artist, status: Media.hasArtist(artist) ? 2 : 0 };
  });
}

export function constructArtistFromBandLab(artist: BandLabArtist): Artist {
  return {
    id: ulid(),
    name: artist.name || "",
    url: `https://bandlab.com/${artist.username}`,
    genres: artist.genres.map((g) => g.name) || [],
    followers: artist.counters.followers || 0,
    icon: artist.picture.s || "",
    providers: {
      [MetadataProviders.BandLab]: artist.id || "",
    },
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
