import { Auth } from "index";
import io from "socket.io-client";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { QueuedAction } from "../server/struct";

export const Queue: Writable<QueuedAction[]> = writable([]);

export const queueSock = io();
queueSock.once("connect", () => {
  queueSock.emit("auth", Auth.authKey);
});
queueSock.on("update", (q) => Queue.set(q));
