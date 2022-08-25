import { ParsedQs } from "qs";
import path from "path";
import { Application, json, Request } from "express";
import fs from "fs";
import { getAllAccounts } from "./utils";
import { APIResponse } from "./struct";
type R = Request<{}, any, any, ParsedQs, Record<string, any>>;
type RunFunction = (req: R) => Promise<APIResponse> | APIResponse;

export default class APIRouteManager {
  public routes: {
    name: string;
    type: "GET" | "POST";
    run: RunFunction;
    requiresAuth: boolean;
  }[] = [];

  constructor(public app: Application) {}
  public init() {
    this.app.get("/api/*", async (req, res, next) => {
      const route = this.routes.find(
        (a) => a.type == "GET" && a.name == path.basename(req.path)
      );
      if (!route) return next();
      if (
        route.requiresAuth &&
        !getAllAccounts().find((a) => a.authToken == req.query.auth)
      )
        return res.json({ err: true, message: "Unauthorized" });
      res.json(await route.run(req));
    });
    this.app.post("/api/*", json(), async (req, res, next) => {
      const route = this.routes.find(
        (a) => a.type == "POST" && a.name == path.basename(req.path)
      );
      if (!route) return next();
      if (
        route.requiresAuth &&
        !getAllAccounts().find((a) => a.authToken == req.body.auth)
      )
        return res.json({ err: true, message: "Unauthorized" });
      res.json(await route.run(req));
    });
    fs.readdirSync(process.cwd() + "/serverDist/API").forEach((r) => {
      require("./API/" + r);
    });
  }

  public create(
    name: string,
    type: "GET" | "POST",
    run: RunFunction,
    requiresAuth = false
  ) {
    this.routes.push({ name, type, run, requiresAuth });
  }
}
