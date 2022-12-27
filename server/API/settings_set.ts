import db from "enhanced.db";
import { APIRouter } from "../server";
import { getSettings } from "../settings";

APIRouter.create(
  "settings_set",
  "POST",
  (req) => {
    const { k, v } = req.body;
    const settings = getSettings();
    if (!Object.keys(settings).includes(k)) return { err: true, message: "Invalid key." };
    if (typeof settings[k] !== typeof v) return { err: true, message: "Invalid value type." };

    settings[k] = v;
    db.set("settings", settings);

    return { err: false };
  },
  true
);
