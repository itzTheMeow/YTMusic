import db from "enhanced.db";
import config from "./config";
import { Account, defaultPermissions } from "./struct";
import { randomUUID } from "crypto";
import { hashSync } from "bcrypt";

export function sanitizeUsername(username: string) {
  return [...String(username)]
    .filter((c) => config.allowUsername.includes(c))
    .join("");
}
const accountCache: Account[] = [];
function grabAccount(data: Account) {
  data.authToken = data.authToken || randomUUID().replace(/-/g, "");
  data.permissions = { ...defaultPermissions, ...data.permissions };
  const i = accountCache.findIndex((a) => a.username == data.username);
  if (i >= 0) accountCache.splice(i, 1);
  accountCache.push(data);
  return data;
}
export function getAllAccounts() {
  return db
    .all()
    .filter((a) => a.key.startsWith("account_"))
    .map((a) => grabAccount(a.value as Account));
}
export function getAccount(username: string): Account | null {
  username = sanitizeUsername(username);
  const exist = accountCache.find((a) => a.username == username);
  if (exist) return exist;
  const account = db.get(`account_${username}`) as Account;
  if (!account) return null;
  return grabAccount(account);
}
export function saveAccount(acc: Account) {
  db.set(`account_${acc.username}`, acc);
}
export function createAccount(
  username: string,
  pwd: string,
  data: Partial<Account> = {}
) {
  const password = hashSync(pwd, 15);
  const acc: Account = {
    username,
    password,
    authToken: "",
    permissions: { ...defaultPermissions, ...{ owner: true } },
  };
  saveAccount(grabAccount({ ...acc, ...data }));
}
