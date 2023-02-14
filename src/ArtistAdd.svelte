<script lang="ts">
  import ArtistCard from "ArtistCard.svelte";
  import { API } from "index";
  import Loader from "Loader.svelte";
  import { offQueueChange, onQueueChange } from "queue";
  import { onDestroy, onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import SwitcherProviders from "SwitcherProviders.svelte";
  import { Check, Dots, Plus } from "tabler-icons-svelte";
  import { highlightSelect, searchTimeout } from "utils";
  import type { MetadataProviders } from "../server/struct";

  let searchInput: HTMLInputElement;
  let selectedProvider: MetadataProviders;

  let searchResults: ReturnType<typeof API.searchArtists>;
  let lastSearched = "";
  function search(bypass = false) {
    if (!bypass && lastSearched == searchInput.value) return;
    if (!searchInput.value) return (searchResults = null as any);
    lastSearched = searchInput.value;
    searchResults = API.searchArtists(searchInput.value, selectedProvider);
  }

  let wasAdded: string[] = [];
  const i = onQueueChange((v) => {
    if (v.type == "ArtistAdd") {
      wasAdded = [...wasAdded, v.id];
    }
  });

  onMount(() => {
    searchInput.select();
  });
  onDestroy(() => {
    offQueueChange(i);
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
      use:highlightSelect
      use:searchTimeout={search}
    />
  </div>
  <SwitcherProviders
    type="meta"
    on:selection={() => search(true)}
    bind:selected={selectedProvider}
    className="mt-4 mb-2"
  />

  {#if searchResults}
    {#await searchResults}
      <Loader />
    {:then artists}
      {#if artists.err}
        <div class="text-sm">{artists.message}</div>
      {:else}
        <div class="flex flex-row flex-wrap gap-4 justify-center mt-3">
          {#if artists.length}
            {#each artists as artist}
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
                        //@ts-ignore
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
          {:else}
            <div>No results found. Try refining your search?</div>
          {/if}
        </div>
      {/if}
    {/await}
  {/if}
</div>
