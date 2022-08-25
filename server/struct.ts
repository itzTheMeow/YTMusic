export interface AccountPermissions {
  owner: boolean;
}
export interface Account {
  username: string;
  password: string;
  authToken: string;
  permissions: AccountPermissions;
}
export const defaultPermissions: AccountPermissions = {
  owner: false,
};

export enum MetadataProviders {
  Spotify,
}
export enum SoundProviders {
  YouTube,
}
export type QueuedAction =
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
      url: string;
      provider: SoundProviders;
    };

export interface Artist {
  id: string;
  name: string;
  url: string;
  genres: string[];
  followers: number;
  icon: string;
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
}
export interface Track {
  title: string;
  url: string;
  number: number;
  duration: number;
  explicit: boolean;
}
export interface ExtendedArtist extends Artist {
  albums: Album[];
}
export interface ArtistMeta extends ExtendedArtist {
  version: 1;
}
