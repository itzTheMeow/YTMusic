import db from "enhanced.db";
import config from "./config";
import { Account } from "./struct";
import { randomUUID } from "crypto";

export function sanitizeUsername(username: string) {
  return [...String(username)]
    .filter((c) => config.allowUsername.includes(c))
    .join("");
}
const accountCache: Account[] = [];
export function getAccount(username: string): Account | null {
  username = sanitizeUsername(username);
  const exist = accountCache.find((a) => a.username == username);
  if (exist) return exist;

  const account = db.get(`account_${username}`) as Account;
  if (!account) return null;
  account.username = account.username || username;
  account.authToken = account.authToken || randomUUID().replace(/-/g, "");
  accountCache.push(account);
  return account;
}
