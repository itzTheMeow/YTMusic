import { APIRouter } from "../server";
import db from "enhanced.db";
import { sanitizeUsername } from "../utils";
import { Account } from "../struct";

APIRouter.create("login", "POST", async (req) => {
  const username = req.body?.username;
  const password = req.body?.password;
  if (!username || !password)
    return { err: true, message: "Invalid details provided." };

  const account = db.get(`account_${sanitizeUsername(username)}`) as Account;
  if (!account) return { err: true, message: "Invalid username." };

  return { err: false, token: "" };
});
