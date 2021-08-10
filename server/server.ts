import express from "express";
import sass from "sass";
import fs from "fs";
import path from "path";
import SpotifyApi from "spotify-web-api-node";
import config from "./config";
import MediaManager from "./MediaManager";
import SpotifyAuthManager from "./SpotifyAuthManager";
import GetArtist from "./GetArtist";
import search from "youtube-search";

// Required music file meta:
// title, artist, album, year, track/total, genre
// cover if applicable
// singles album=Single track/total=track/1

// register app and input credentials into auth.json
// https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app
const sauth = require("../auth.json");
const spapi = new SpotifyApi({
  clientId: sauth.clientID,
  clientSecret: sauth.clientSecret,
});

// make a project and generate an api key and input into auth.json
// https://console.cloud.google.com/apis/credentials
// enable youtube at https://console.cloud.google.com/apis/api/youtube.googleapis.com/overview

(async function () {
  const authman = new SpotifyAuthManager(sauth.clientID, sauth.clientSecret, spapi);
  spapi.setAccessToken(await authman.generateToken());

  const mediaman = new MediaManager(config.library, spapi);

  let allStyle = "";
  fs.readdirSync("client/css").forEach((css) => {
    let compiled = sass.renderSync({ file: `client/css/${css}` });
    allStyle += String(`${compiled.css}\n`);
  });
  if (allStyle) fs.writeFileSync("client/style.css", allStyle);
  else console.error("No css.");

  function getHTML(file: string) {
    let HTML = "Error.";
    try {
      HTML = String(fs.readFileSync(`client/pages/${file}`));
    } catch (er) {
      HTML = String(fs.readFileSync(`client/pages/404.html`));
    }
    fs.readdirSync("client/modules").forEach((m) => {
      let content = String(fs.readFileSync(`client/modules/${m}`));
      HTML = HTML.replace(new RegExp(`{{${m.split(".")[0]}}}`, "g"), content);
    });
    return HTML;
  }

  const app = express();

  app.enable("trust proxy");
  app.use(express.json());
  app.use((req, res, next) => {
    // might not be needed
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.protocol == "https") return res.redirect("http://" + req.get("host") + req.url);

    next();
  });

  app.get("/", (req, res) => {
    res.send(getHTML("../index.html"));
  });
  app.get("/style.css", (req, res) => {
    res.sendFile(path.resolve("client/style.css"));
  });
  app.get("/logo.png", (req, res) => {
    res.sendFile(path.resolve("client/logo.png"));
  });
  app.get("/api/artist", async (req, res) => {
    if (req.query.name)
      res.json((await spapi.searchArtists(String(req.query.name), { limit: 35 })).body);
    else res.status(501).json({ err: true });
  });
  app.get("/api/artists/:action", async (req, res) => {
    switch (req.params.action) {
      case "add":
        if (!req.query.id) return res.status(501).json({ err: true });
        let newArtist = await GetArtist(String(req.query.id));
        mediaman.addArtist(newArtist);
        res.json(newArtist);
        break;
      case "list":
        res.json(mediaman.artists.map((a) => a.id));
        break;
      case "all":
        res.json(mediaman.artists);
        break;
      default:
        res.status(501).json({ err: true });
        break;
    }
  });
  app.get("/api/youtube/:action", async (req, res) => {
    switch (req.params.action) {
      case "search":
        if (!req.query.q) return res.status(501).json({ err: true });
        let searchResults = await search(decodeURIComponent(String(req.query.q)), {
          key: sauth.youtube,
          order: "relevance",
          part: "contentDetails",
        });
        res.json(searchResults.results);
        break;
      default:
        res.status(501).json({ err: true });
        break;
    }
  });
  app.get("/:w", (req, res) => {
    res.send(getHTML(`${req.params.w}.html`));
  });

  app.listen(config.port, () => {
    console.log(`Server is online and listening at http://localhost:${config.port}`);
  });
})();

export { spapi };
