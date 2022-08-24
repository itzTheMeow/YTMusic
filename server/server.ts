import fs from "fs";
import express from "express";
import config from "./config";
import APIRouteManager from "./APIRoute";
import db from "enhanced.db";
import { createAccount, getAllAccounts } from "./utils";
import { randomUUID } from "crypto";
import SpotifyAuthManager from "./Spotify";

const spauth = (() => {
  try {
    return JSON.parse(fs.readFileSync(`${process.cwd()}/auth.json`).toString()) as {
      id: string;
      secret: string;
    };
  } catch {
    console.error("Invalid auth.json file! Please read the documentation and fix it.");
    process.exit();
  }
})();

export let APIRouter: APIRouteManager;
export const Spotify = new SpotifyAuthManager(spauth.id, spauth.secret);

export function init() {
  console.log("Initiating API.");
  fs.copyFileSync("src/index.html", "dist/index.html");

  const app = express();
  APIRouter = new APIRouteManager(app);
  APIRouter.init();
  app.use(express.static(process.cwd() + "/dist"));
  app.get("*", (req, res) => {
    res.sendFile(process.cwd() + "/dist/index.html");
  });
  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}.`);
  });

  if (!getAllAccounts().find((a) => a.permissions.owner)) {
    const pass = randomUUID().split("-")[0];
    createAccount("admin", pass);
    console.log(`Creating admin account with username "admin" and password "${pass}".`);
  }
}
