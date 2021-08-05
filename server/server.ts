import express from "express";
import sass from "sass";
import fs from "fs";
import path from "path";
import { Includes, MusicBrainzApi } from "musicbrainz-api";
import config from "./config";
import MediaManager from "./MediaManager";

const mb = new MusicBrainzApi({
  appName: config.brandName,
  appVersion: config.version,
  appContactInfo: "erty2pop@gmail.com",
});
const mediaman = new MediaManager(config.library, mb);

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
  if (req.query.name) res.json(await mb.searchArtist(String(req.query.name)));
  else res.status(501).json({ err: true });
});
app.get("/api/artists/:action", async (req, res) => {
  switch (req.params.action) {
    case "add":
      if (!req.query.id) return res.status(501).json({ err: true });
      let artist = await mb.getArtist(String(req.query.id), ["releases", "release-groups"]);
      mediaman.addArtist({
        id: artist.id,
        name: artist.name,
        disambiguation: artist.disambiguation || "None",
        type: artist.type,
        gender: String(artist.gender) == "null" ? undefined : String(artist.gender),
        country: artist.country,
        releases: artist.releases?.map((r) => r.id),
        releaseGroups: artist["release-groups"]?.map((g) => g.id),
      });
      res.json(artist);
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
app.get("/:w", (req, res) => {
  res.send(getHTML(`${req.params.w}.html`));
});

app.listen(config.port, () => {
  console.log(`Server is online and listening at http://localhost:${config.port}`);
});
