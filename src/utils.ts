import {
  MetadataProviders,
  SoundProviders,
  type Artist,
} from "../server/struct";

export const Providers: {
  [key in MetadataProviders | SoundProviders]: string;
} = {
  [MetadataProviders.Spotify]: "#1DB954",
  [MetadataProviders.SoundCloud]: "#F26F23",
  [MetadataProviders.Konami]: "#B60014",
  [MetadataProviders.BandLab]: "#f12c18",
  [SoundProviders.YouTube]: "#ff0000",
};

// https://stackoverflow.com/questions/46432335/hex-to-hsl-convert-javascript
export function hex2hsl(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
  let r = parseInt(result[1], 16),
    g = parseInt(result[2], 16),
    b = parseInt(result[3], 16);
  (r /= 255), (g /= 255), (b /= 255);
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;
  if (max == min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  s = s * 100;
  s = Math.round(s);
  l = l * 100;
  l = Math.round(l);
  h = Math.round(360 * h);
  return `${h} ${s}% ${l}%`;
}
