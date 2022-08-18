import config from "./config";

export function sanitizeUsername(username: string) {
  return [...String(username)]
    .filter((c) => config.allowUsername.includes(c))
    .join("");
}
