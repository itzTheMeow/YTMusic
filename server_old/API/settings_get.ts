import { APIRouter } from "../server";
import { getSettings } from "../settings";

APIRouter.create(
  "settings_get",
  "POST",
  (req) => {
    return {
      err: false,
      settings: getSettings(),
    };
  },
  true
);
