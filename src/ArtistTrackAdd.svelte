<script lang="ts">
  import { API } from "index";
  import Loader from "Loader.svelte";
  import { DateTime } from "luxon";
  import ProviderIcon from "ProviderIcon.svelte";
  import { onDestroy } from "svelte";
  import SwitcherProviders from "SwitcherProviders.svelte";
  import { ArrowBack, Download, ExternalLink, Eye, X } from "tabler-icons-svelte";
  import { highlightSelect, Providers, searchTimeout, stringDuration } from "utils";
  import type { Album, Artist, Downloadable, Track } from "../server/struct";
  import { SoundProviders } from "../server/struct";

  export let artist: Artist;
  export let album: Album;
  export let track: Track;

  let embedding: Downloadable | null = null,
    selectedProvider: SoundProviders;
  let modal: HTMLDivElement, searchInput: HTMLInputElement;

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
        trackFetch = API.searchTrack(selectedProvider, searchTerm);
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
      provider: selectedProvider,
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
  <div class="modal-box flex flex-col h-full w-11/12 max-w-5xl">
    {#if embedding}
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
      <div>
        <h3 class="font-bold text-lg mb-1">
          {artist.name} - {track.title} ({stringDuration(track.duration)})
        </h3>
        <div class="flex gap-2 items-center mb-2">
          <input
            type="text"
            placeholder="Search {Object.entries(SoundProviders).find(
              (e) => e[1] == selectedProvider
            )?.[0] || ''}"
            class="input input-bordered block flex-1"
            use:highlightSelect
            use:searchTimeout={() => (searchTerm = searchInput.value)}
            value={searchTerm}
            bind:this={searchInput}
          />
          <SwitcherProviders
            type="sound"
            select={album.provider}
            bind:selected={selectedProvider}
            on:selection={() => (fetched = null)}
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        {#await trackFetch}
          <Loader />
        {:then res}
          {#if res.err}
            <div class="text-sm">{res.message}</div>
          {:else}
            <div class="flex flex-wrap gap-1 justify-center">
              {#each res.list as dl}
                <div
                  class="aspect-video relative rounded-3xl box-border overflow-hidden w-[calc(33%-0.5rem)] [@media(max-width:800px)]:w-[calc(50%-0.5rem)] [@media(max-width:600px)]:!w-full"
                >
                  <div class="w-full h-full avatar">
                    <div class="w-full h-full">
                      <img src={dl.thumbnail} alt={dl.title} class="object-contain blur-[2px]" />
                    </div>
                  </div>
                  <div
                    class="absolute top-0 left-0 bg-black bg-opacity-50 w-full h-full flex flex-col gap-1.5 p-2.5 justify-end"
                  >
                    <div class="font-bold text-lg">
                      {dl.title.length > 32 ? dl.title.slice(0, 32).trim() + "..." : dl.title}
                    </div>
                    <a
                      class="flex items-center gap-1 text-sm font-semibold"
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
                    <div class="flex gap-2 items-center">
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
                      <div style:color={Providers[selectedProvider]} class="-ml-0.5">
                        <ProviderIcon provider={selectedProvider} size={20} />
                      </div>
                    </div>
                    <div class="mt-0.5">
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
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        {/await}
      </div>
    {/if}
    <a href={"#"} class="btn btn-sm btn-circle absolute right-2 top-2"><X /></a>
  </div>
</div>
