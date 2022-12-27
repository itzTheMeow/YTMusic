export interface AccountPermissions {
  owner: boolean;
  artistAdd: boolean;
  artistRemove: boolean;
  songDownload: boolean;
  songRemove: boolean;
}
export interface Account {
  username: string;
  password: string;
  authToken: string;
  permissions: AccountPermissions;
}
export const defaultPermissions: AccountPermissions = {
  owner: false,
  artistAdd: true,
  artistRemove: false,
  songDownload: true,
  songRemove: false,
};

export type APIResponse = { err: true; message: string } | { err: false; [key: string]: any };

export enum MetadataProviders {
  Spotify = "spotify",
  SoundCloud = "soundcloud",
  Konami = "konami",
  BandLab = "bandlab",
}
export enum SoundProviders {
  YouTube = "youtube",
}
export type QueuedAction = (
  | {
      type: "ArtistAdd";
      id: string;
      provider: MetadataProviders;
    }
  | {
      type: "ArtistDelete";
      id: string;
    }
  | { type: "LibraryScan" }
  | {
      type: "SongDownload";
      artist: Artist;
      album: Album;
      track: Track;
      provider: SoundProviders;
      url: string;
    }
  | {
      type: "SongDelete";
      artist: Artist;
      album: Album;
      track: Track;
    }
) & { time?: number };

export interface Artist {
  id: string;
  name: string;
  url: string;
  genres: string[];
  followers: number;
  icon: string;
  providers: Partial<Record<MetadataProviders, string>>;
  status?: 0 | 1 | 2;
}
export interface Album {
  type: "album" | "single";
  id: string;
  name: string;
  url: string;
  year: number;
  image: string;
  tracks: Track[];
  uuid: string;
  provider: MetadataProviders;
}
export interface Track {
  id: string;
  title: string;
  url: string;
  number: number;
  duration: number;
  explicit: boolean;
  added?: boolean;
  uuid: string;
}
export interface ExtendedArtist extends Artist {
  albums: Album[];
}
export interface ArtistMeta extends ExtendedArtist {
  version: 2;
}

export interface Downloadable {
  title: string;
  duration: number;
  uploadedAt: number;
  views: number;
  thumbnail: string;
  author: {
    name: string;
    icon: string;
    url: string;
  };
  url: string;
  embed: string;
}
export interface Settings {
  libraryFolder: string;
}
