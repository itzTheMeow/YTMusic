import { APIRouter } from "../server";
import { getAllAccounts, grabAccount, saveAccount } from "../utils";
import bcrypt from "bcrypt";

APIRouter.create(
  "pass_change",
  "POST",
  async (req) => {
    const account = getAllAccounts().find((a) => a.authToken == req.body.auth);
    if (!account) return { err: true, message: "No account." };

    if (!(await bcrypt.compare(req.body.old, account.password)))
      return { err: true, message: "Password is incorrect." };

    if (!req.body.new || typeof req.body.new !== "string")
      return { err: true, message: "Invalid new password." };
    account.password = await bcrypt.hash(req.body.new, 15);
    account.authToken = "";
    saveAccount(grabAccount(account));
    return { err: false };
  },
  true
);
