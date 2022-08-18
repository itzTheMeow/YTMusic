import { ParsedQs } from "qs";
import path from "path";
import { Application, json, Request } from "express";
import fs from "fs";
type R = Request<{}, any, any, ParsedQs, Record<string, any>>;
type RunFunction = (req: R) => object;

export default class APIRouteManager {
  public routes: { name: string; type: "GET" | "POST"; run: RunFunction }[] =
    [];

  constructor(public app: Application) {}
  public init() {
    this.app.get("/api/*", async (req, res, next) => {
      const route = this.routes.find(
        (a) => a.type == "GET" && a.name == path.basename(req.originalUrl)
      );
      if (!route) return next();
      res.json(await route.run(req));
    });
    this.app.post("/api/*", json(), async (req, res, next) => {
      const route = this.routes.find(
        (a) => a.type == "POST" && a.name == path.basename(req.originalUrl)
      );
      if (!route) return next();
      res.json(await route.run(req));
    });
    fs.readdirSync(process.cwd() + "/serverDist/API").forEach((r) => {
      require("./API/" + r);
    });
  }

  public create(name: string, type: "GET" | "POST", run: RunFunction) {
    this.routes.push({ name, type, run });
  }
}
