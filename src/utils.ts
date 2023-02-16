import { Duration } from "luxon";
import {
  MetaProviderBandLab,
  MetaProviderKonami,
  MetaProviderSoundCloud,
  MetaProviderSpotify,
  SoundProviderYouTube,
  type AccountPermissions,
  type MetadataProvider,
  type SoundProvider,
} from "typings_struct";

export const Providers: {
  [key in MetadataProvider | SoundProvider]: string;
} = {
  [MetaProviderSpotify]: "#1DB954",
  [MetaProviderSoundCloud]: "#F26F23",
  [MetaProviderKonami]: "#B60014",
  [MetaProviderBandLab]: "#f12c18",
  [SoundProviderYouTube]: "#ff0000",
};
export const Permissions: { [key in keyof AccountPermissions]: string } = {
  artistAdd: "Allows adding new artists and refreshing metadata on existing artists.",
  artistRemove: "Allows deleting any artist (and their songs/metadata)",
  artistRemoveSelf: "Allows deleting only artists added by the user.",
  owner: "Has all permissions on the server. Can promote and demote any other owner.",
  songDownload: "Allows downloading new songs.",
  songRemove: "Allows deleting downloaded songs.",
  songRemoveSelf: "Allows deleting only songs downloaded by the user.",
};

export function stringDuration(duration: number) {
  return Duration.fromObject({
    minutes: 0,
    seconds: Math.floor(duration / 1000),
  })
    .normalize()
    .toFormat("mm:ss");
}

export function highlightSelect(element: HTMLInputElement) {
  let inputSelected = true;
  element.addEventListener("click", () => {
    if (!inputSelected) element.select();
    inputSelected = true;
  });
  element.addEventListener("blur", () => {
    inputSelected = false;
  });
}
export function searchTimeout(element: HTMLInputElement, callback: () => any) {
  let wantSearch = false,
    searchWaiting: number;
  const searchCheck = setInterval(function () {
    if (wantSearch) {
      callback();
      wantSearch = false;
    }
  }, 1000);

  element.addEventListener("keyup", () => {
    wantSearch = true;
    clearTimeout(searchWaiting);
    searchWaiting = setTimeout(() => callback(), 700);
  });

  return {
    destroy() {
      clearInterval(searchCheck);
    },
  };
}
