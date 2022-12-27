<script lang="ts">
  import ArtistCard from "ArtistCard.svelte";
  import { API } from "index";
  import Loader from "Loader.svelte";
  import ProviderIcon from "ProviderIcon.svelte";
  import { offQueueChange, onQueueChange } from "queue";
  import { onDestroy, onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { Check, Dots, Plus } from "tabler-icons-svelte";
  import { hex2hsl, Providers } from "utils";
  import { MetadataProviders } from "../server/struct";

  let searchInput: HTMLInputElement;
  let wantSearch = false;
  let inputSelected = true;
  let selectedProvider: MetadataProviders = MetadataProviders.Spotify;

  let searchResults: ReturnType<typeof API.searchArtist>;
  let lastSearched = "";
  function search(bypass = false) {
    if (!bypass && lastSearched == searchInput.value) return;
    if (!searchInput.value) return (searchResults = null as any);
    lastSearched = searchInput.value;
    searchResults = API.searchArtist(searchInput.value, selectedProvider);
  }

  let wasAdded: string[] = [];
  const i = onQueueChange((v) => {
    if (v.type == "ArtistAdd") {
      wasAdded = [...wasAdded, v.id];
    }
  });

  const searchCheck = setInterval(function () {
    if (wantSearch) {
      search();
      wantSearch = false;
    }
  }, 1000);
  let searchWaiting: number;
  onMount(() => {
    searchInput.select();
  });
  onDestroy(() => {
    offQueueChange(i);
    clearInterval(searchCheck);
  });
</script>

<div class="flex flex-col">
  <div class="flex flex-col">
    <div class="text-lg w-full max-w-3xl m-auto pl-2">Add an Artist</div>
    <input
      type="text"
      placeholder="Search for a an artist..."
      class="input input-bordered block w-full max-w-3xl m-auto"
      bind:this={searchInput}
      on:click={() => {
        if (!inputSelected) searchInput.select();
        inputSelected = true;
      }}
      on:blur={() => {
        inputSelected = false;
      }}
      on:keyup={() => {
        wantSearch = true;
        clearTimeout(searchWaiting);
        searchWaiting = Number(setTimeout(search, 700));
      }}
    />
  </div>
  <div class="btn-group w-full justify-center mt-4 mb-2">
    {#each Object.values(MetadataProviders) as prov}
      <button
        class="btn {selectedProvider == prov ? 'btn-active' : ''}"
        style={`--${selectedProvider == prov ? "p" : "nc"}:${hex2hsl(Providers[prov])};`}
        on:click={() => ((selectedProvider = prov), search(true))}
        ><ProviderIcon size={26} provider={prov} /></button
      >
    {/each}
  </div>

  {#if searchResults}
    {#await searchResults}
      <Loader />
    {:then artists}
      {#if artists.err}
        <div class="text-sm">{artists.message}</div>
      {:else}
        <div class="flex flex-row flex-wrap gap-4 justify-center mt-3">
          {#each artists.list as artist}
            <ArtistCard {artist}>
              <div
                class="ml-auto mb-auto cursor-pointer"
                on:click={async () => {
                  if (wasAdded.find((w) => Object.values(artist.providers).includes(w)))
                    artist.status = 2;
                  switch (artist.status) {
                    case 2:
                      const d = await API.listArtists();
                      if (d.err) return;
                      navigate(
                        `/artists/${
                          d.list.find((a) => a.name == artist.name)?.id || artist.id
                        }/manage`
                      );
                      break;
                    case 1: //@ts-ignore
                      document.getElementById("queueButton").focus();
                      break;
                    default:
                      await API.post("artist_add", {
                        id: Object.entries(artist.providers)[0][1],
                        source: Object.entries(artist.providers)[0][0],
                      });
                      artist.status = 1;
                      artists = artists;
                  }
                }}
              >
                {#if artist.status == 2 || wasAdded.find( (w) => Object.values(artist.providers).includes(w) )}
                  <div class="text-success">
                    <Check size={40} />
                  </div>
                {:else if artist.status == 1}
                  <div class="text-primary-content">
                    <Dots size={40} />
                  </div>
                {:else}
                  <div class="text-primary hover:text-success">
                    <Plus size={40} />
                  </div>
                {/if}
              </div>
            </ArtistCard>
          {/each}
        </div>
      {/if}
    {/await}
  {/if}
</div>
