import fs from "fs";
import express from "express";
import config from "./config";
import APIRouteManager from "./APIRoute";
import db from "enhanced.db";
import { createAccount, getAllAccounts } from "./utils";
import { randomUUID } from "crypto";
import SpotifyAuthManager from "./Spotify";
import MediaManager from "./MediaManager";
import { Server } from "socket.io";
import { Account } from "./struct";
import SoundCloudAuthManager from "./SoundCloud";

const spauth = (() => {
  try {
    return JSON.parse(
      fs.readFileSync(`${process.cwd()}/auth.json`).toString()
    ) as {
      id: string;
      secret: string;
    };
  } catch {
    console.error(
      "Invalid auth.json file! Please read the documentation and fix it."
    );
    process.exit();
  }
})();

export let APIRouter: APIRouteManager;
export const Spotify = new SpotifyAuthManager(spauth.id, spauth.secret);
export const SoundCloud = new SoundCloudAuthManager();
export const Media = new MediaManager();

export function init() {
  console.log("Initiating API.");
  Media.init();
  fs.copyFileSync("src/index.html", "dist/index.html");

  const app = express();
  APIRouter = new APIRouteManager(app);
  APIRouter.init();
  app.use(express.static(process.cwd() + "/dist"));
  app.get("*", (req, res) => {
    res.sendFile(process.cwd() + "/dist/index.html");
  });
  const serv = app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}.`);
  });
  const io = new Server(serv);
  io.on("connection", (socket) => {
    let authorized: Account | null = null;
    const listener = Media.onQueueUpdate(() => {
      if (authorized) socket.emit("update", Media.queue);
    });
    socket.once("auth", (token) => {
      const account = getAllAccounts().find((a) => a.authToken == token);
      if (!account) return socket.disconnect(true);
      authorized = account;
    });
    socket.on("disconnect", () => {
      Media.offQueueUpdate(listener);
    });
  });

  if (!getAllAccounts().find((a) => a.permissions.owner)) {
    const pass = randomUUID().split("-")[0];
    createAccount("admin", pass);
    console.log(
      `Creating admin account with username "admin" and password "${pass}".`
    );
  }
}
