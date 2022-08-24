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
