import { MetadataProviders, MetadataProvidersList } from "../server/struct";

export const Providers: {
  [key in MetadataProviders]: string;
} = {
  [MetadataProviders.Spotify]: "#1DB954",
  [MetadataProviders.SoundCloud]: "#F26F23",
};
export function getProviders(list: string[]) {
  return list.map((p) =>
    Number(Object.entries(MetadataProvidersList).find((e) => e[1] == p)?.[0])
  ) as MetadataProviders[];
}
