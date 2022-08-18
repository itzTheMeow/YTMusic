import fs from "fs";
import express from "express";
import config from "./config";
import APIRouteManager from "./APIRoute";
import db from "enhanced.db";

export let APIRouter: APIRouteManager;

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
}
