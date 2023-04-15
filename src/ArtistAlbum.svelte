<script lang="ts">
  import { IconDownload, IconExternalLink, IconTrash } from "@tabler/icons-svelte";
  import ArtistProviders from "ArtistProviders.svelte";
  import ArtistTrackAdd from "ArtistTrackAdd.svelte";
  import { API } from "index";
  import Loader from "Loader.svelte";
  import { Duration } from "luxon";
  import { onDestroy } from "svelte";
  import { link } from "svelte-routing";
  import { QALibraryScan } from "typings_queue";
  import type { Album, Artist } from "typings_struct";

  export let id: string;
  export let albid: string;

  let albumDetails = new Promise<{ a: Artist; l: Album } | string>(async (r) => {
    const res = await API.fetchArtist(id);
    if (res.err) return r(res.message!);
    const l = res.albums!.find((a) => a.id == albid);
    if (!l) return r("Album not found.");
    r({
      a: res,
      l,
    });

    setTimeout(
      () => window.location.hash.substring(1) && (window.location.hash = window.location.hash),
      10
    );
  });

  //TODO: redo this to not use await
  const i = API.onQueueChange(async (e) => {
    if (e.type == QALibraryScan && e.is == "remove") {
      const res = await API.fetchArtist(id);
      if (res.err) return (albumDetails = new Promise((r) => r(res.message!)));
      const l = res.albums!.find((a) => a.id == albid);
      if (!l) return (albumDetails = new Promise((r) => r("Album not found.")));
      albumDetails = new Promise((r) =>
        r({
          a: res,
          l,
        })
      );
      setTimeout(
        () => window.location.hash.substring(1) && (window.location.hash = window.location.hash),
        10
      );
    }
  });
  onDestroy(() => API.offQueueChange(i));
</script>

{#await albumDetails}
  <Loader />
{:then res}
  {#if typeof res == "string"}
    <div class="text-sm">{res}</div>
  {:else}
    <div class="card w-3/4 bg-base-300 shadow-xl box-border m-auto">
      <div class="card-body">
        <h2 class="card-title flex-wrap">
          <div class="avatar">
            <div class="w-36 rounded">
              <img src={res.l.image} alt={res.l.name} />
            </div>
            <span
              class="flex items-center justify-center w-full h-full bg-black
                bg-opacity-50 absolute rounded"
              ><span
                class={`radial-progress ${(() => {
                  const len = res.l.tracks.filter((t) => t.added).length;
                  if (len == res.l.tracks.length) return "text-success";
                  else if (len == 0) return "text-error";
                  else return "text-warning";
                })()}`}
                style={`--value:${
                  (res.l.tracks.filter((t) => t.added).length / res.l.tracks.length) * 100
                };--size:7rem;--thickness:0.5rem;`}
              >
                {res.l.tracks.filter((t) => t.added).length}/{res.l.tracks.length}
              </span></span
            >
          </div>
          <div class="flex flex-col gap-1 ml-1">
            <div class="flex items-center gap-1">
              <div class="text-3xl">{res.l.name} ({res.l.year})</div>
              <a class="text-secondary" href={res.l.url} target="_blank" rel="noreferrer"
                ><IconExternalLink size={32} /></a
              >
            </div>
            <div class="flex items-center gap-1">
              <a
                class="flex items-center gap-1 text-sm"
                href={`/artists/${res.a.id}/manage`}
                use:link
              >
                {#if res.a.icon}
                  <div class="avatar">
                    <div class="w-5 rounded-full">
                      <img src={res.a.icon} alt={res.a.name} />
                    </div>
                  </div>
                {:else}
                  <div class="avatar placeholder">
                    <div
                      class="w-5 rounded-full bg-neutral-focus
                        text-neutral-content"
                    >
                      <span class="text-xs">
                        {res.a.name
                          .split(/ +/g)
                          .slice(0, 1)
                          .map((a) => a[0].toUpperCase())
                          .join("")}
                      </span>
                    </div>
                  </div>
                {/if}
                {res.a.name}
              </a>
              <div class="badge badge-accent badge-sm">
                {res.l.type.toUpperCase()}
              </div>
              <ArtistProviders providers={[res.l.provider]} />
            </div>
          </div>
        </h2>
      </div>
    </div>
    <div class="overflow-x-auto my-4">
      <table class="table table-zebra w-3/4 m-auto">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Duration</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {#each res.l.tracks as track (track.id)}
            <tr>
              <th>{track.number}</th>
              <td>
                {track.title}
                {#if track.explicit}
                  <div class="badge badge-info">E</div>
                {/if}
              </td>
              <td>
                {Duration.fromObject({
                  minutes: 0,
                  seconds: Math.floor(track.duration / 1000),
                })
                  .normalize()
                  .toFormat("mm:ss")
                  .replace(/,/g, "")}
              </td>
              <td class="text-right">
                {#if track.added}
                  <div
                    class="btn btn-square btn-sm btn-error"
                    on:click={async (e) => {
                      //@ts-ignore
                      e.target.classList.add("btn-outline");
                      await API.post("/track_delete", {
                        artist: res.a.id,
                        album: res.l.id,
                        track: track.id,
                      });
                    }}
                  >
                    <IconTrash />
                  </div>
                {:else}
                  <a class="btn btn-square btn-sm btn-primary" href={`#${track.id}`}>
                    <IconDownload />
                  </a>
                {/if}
                <a
                  class="btn btn-square btn-sm btn-secondary"
                  href={track.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconExternalLink />
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#each res.l.tracks as track (track.id)}
      <ArtistTrackAdd artist={res.a} album={res.l} {track} />
    {/each}
  {/if}
{/await}
