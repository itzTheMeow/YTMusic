import { APIRouter, Media } from "../server";

APIRouter.create(
  "scan_lib",
  "POST",
  (req) => {
    Media.queueAction({ type: "LibraryScan" });
    return { err: false };
  },
  true
);
