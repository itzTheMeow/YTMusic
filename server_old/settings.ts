import db from "enhanced.db";
import { Settings } from "./struct";

export function getSettings(): Settings {
  return {
    ...{
      libraryFolder: "./Music",
    },
    ...(db.get("settings") as any),
  };
}
