import axios from "axios";
import { ulid } from "ulid";
import { AuthTokens, Media } from "../server";
import { Artist, MetadataProviders } from "../struct";

interface BandlabPicture {
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
  picture: BandlabPicture;
  skills: {
    id: string;
    name: string;
  }[];
  username: string;
}

const API = "https://bandlab.com/api/v1.3";

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
