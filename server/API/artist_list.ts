import { APIRouter, Media } from "../server";
import { Artist } from "../struct";

APIRouter.create(
  "artist_list",
  "POST",
  (req) => {
    return {
      err: false,
      list: Media.artists.map((a): Artist => {
        a = JSON.parse(JSON.stringify(a));
        delete a.albums;
        delete a.version;
        return a;
      }),
    };
  },
  true
);
