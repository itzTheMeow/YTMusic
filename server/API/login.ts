import { APIRouter } from "../server";
import bcrypt from "bcrypt";
import { getAccount } from "../utils";

APIRouter.create("login", "POST", async (req) => {
  const username = req.body?.username;
  const password = req.body?.password;
  if (!username || !password)
    return { err: true, message: "Invalid details provided." };

  const account = getAccount(username);
  if (!account) return { err: true, message: "Account does not exist." };

  const isValid = bcrypt.compare(String(password), account.password);
  if (!isValid) return { err: true, message: "Incorrect password." };

  return { err: false, token: account.authToken };
});
