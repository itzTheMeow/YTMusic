import { Auth } from "index";
import io from "socket.io-client";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import type { QueuedAction } from "../server/struct";

export const Queue: Writable<QueuedAction[]> = writable([]);

export const queueSock = io();
queueSock.once("connect", () => {
  queueSock.emit("auth", Auth.authKey);
});
let previous: QueuedAction[] = [];
queueSock.on("update", (q: QueuedAction[]) => {
  const isNew = q.filter((q) => !previous.find((p) => p.time == q.time));
  previous.forEach((p) => {
    if (isNew.find((n) => n.time == p.time)) return;
    if (!q.find((q) => q.time == p.time)) queueListeners.forEach(({ cb }) => cb(p));
  });
  Queue.set(q);
  previous = [...q];
});

const queueListeners: { id: number; cb: (c: QueuedAction) => any }[] = [];
export function onQueueChange(cb: (c: QueuedAction) => any) {
  const id = Date.now();
  queueListeners.push({ id, cb });
  return id;
}
export function offQueueChange(id: number) {
  const i = queueListeners.findIndex((q) => q.id == id);
  if (i >= 0) queueListeners.splice(i, 1);
}
