<script lang="ts">
  import { API } from "index";
  import Loader from "Loader.svelte";
  import { DateTime } from "luxon";
  import { onDestroy } from "svelte";
  import { ArrowBack, Download, ExternalLink, Eye, X } from "tabler-icons-svelte";
  import { stringDuration } from "utils";
  import type { Album, Artist, Downloadable, Track } from "../server/struct";
  import { SoundProviders } from "../server/struct";

  export let artist: Artist;
  export let album: Album;
  export let track: Track;

  let embedding: Downloadable | null = null;
  let modal: HTMLDivElement;

  let searchTerm = `${artist.name} - ${track.title}`;

  let fetched: string | null = null;
  let trackFetch: ReturnType<typeof API.searchTrack> = new Promise((r) =>
    r({
      err: true,
      message: "...",
    })
  );
  const check = setInterval(() => {
    if (!modal) return;
    if (window.getComputedStyle(modal).visibility == "visible") {
      if (fetched !== searchTerm) {
        fetched = searchTerm;
        trackFetch = API.searchTrack(SoundProviders.YouTube, searchTerm);
      }
    } else if (embedding) embedding = null;
  }, 10);
  onDestroy(() => clearInterval(check));

  async function handleDL(e: MouseEvent, url: string) {
    const btn = e.target as HTMLElement;
    btn.classList.add("loading");
    const res = await API.post("/track_add", {
      artist: artist.id,
      album: album.id,
      track: track.id,
      provider: SoundProviders.YouTube,
      url,
    });
    if (res.err) {
      alert(`Error submitting download request:\n${res.message}`);
      btn.classList.remove("loading");
    } else {
      //@ts-ignore
      document.querySelector(`[href="#${track.id}"]`).classList.add("btn-success");
      window.location.hash = "";
    }
  }
</script>

<div class="modal" id={track.id} bind:this={modal}>
  <div class="modal-box w-11/12 max-w-5xl">
    {#await trackFetch}
      <Loader />
    {:then res}
      {#if res.err}
        <div class="text-sm">{res.message}</div>
      {:else if embedding}
        <div class="flex items-center justify-center gap-2 flex-col">
          <iframe
            class="block m-auto max-w-2xl"
            width="100%"
            src={embedding.embed}
            title="Video Embed"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            style="aspect-ratio: 560 / 315;"
          />
          <div class="btn btn-square" on:click={() => (embedding = null)}>
            <ArrowBack />
          </div>
          <div
            class="btn btn-sm btn-square btn-primary"
            on:click={(e) => {
              //@ts-ignore
              handleDL(e, embedding.url);
            }}
          >
            <Download />
          </div>
        </div>
      {:else}
        <h3 class="font-bold text-lg mb-1">
          {artist.name} - {track.title} ({stringDuration(track.duration)})
        </h3>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <tbody>
              {#each res.list as dl}
                <tr>
                  <td class="font-bold">
                    <div class="flex gap-2">
                      <div class="avatar">
                        <div class="h-16 w-28 rounded">
                          <img src={dl.thumbnail} alt={dl.title} />
                        </div>
                      </div>
                      <div class="flex flex-col h-full gap-2">
                        <div>
                          {dl.title.length > 64 ? dl.title.slice(0, 64).trim() + "..." : dl.title}
                        </div>
                        <div class="flex gap-2">
                          <a
                            class="flex items-center gap-1 text-sm"
                            href={dl.author.url}
                            target="_blank"
                          >
                            <div class="avatar">
                              <div class="w-5 rounded-full">
                                <img src={dl.author.icon} alt={dl.author.name} />
                              </div>
                            </div>
                            {dl.author.name}
                          </a>
                          <div
                            class="badge {dl.duration + 1500 >= track.duration &&
                            track.duration >= dl.duration - 1500
                              ? 'badge-success'
                              : ''}"
                          >
                            {stringDuration(dl.duration)}
                          </div>
                          <div class="badge badge-accent">
                            {DateTime.fromMillis(dl.uploadedAt).toRelative()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      class="btn btn-sm btn-square btn-primary"
                      on:click={(e) => handleDL(e, dl.url)}
                    >
                      <Download />
                    </div>
                    <div
                      class="btn btn-sm btn-square btn-secondary"
                      on:click={() => (embedding = dl)}
                    >
                      <Eye />
                    </div>
                    <a class="btn btn-sm btn-square btn-accent" href={dl.url} target="_blank">
                      <ExternalLink />
                    </a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/await}
    <a href={"#"} class="btn btn-sm btn-circle absolute right-2 top-2"><X /></a>
  </div>
</div>
