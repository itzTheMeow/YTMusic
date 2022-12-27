import { Duration } from "luxon";
import { MetadataProviders, SoundProviders } from "../server/struct";

export const Providers: {
  [key in MetadataProviders | SoundProviders]: string;
} = {
  [MetadataProviders.Spotify]: "#1DB954",
  [MetadataProviders.SoundCloud]: "#F26F23",
  [MetadataProviders.Konami]: "#B60014",
  [MetadataProviders.BandLab]: "#f12c18",
  [SoundProviders.YouTube]: "#ff0000",
};

export function stringDuration(duration: number) {
  return Duration.fromObject({
    minutes: 0,
    seconds: Math.floor(duration / 1000),
  })
    .normalize()
    .toFormat("mm:ss");
}
