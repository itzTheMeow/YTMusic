<script lang="ts">
  import ArtistCard from "ArtistCard.svelte";
  import { API } from "index";
  import Loader from "Loader.svelte";
  import { onDestroy, onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import SwitcherProviders from "SwitcherProviders.svelte";
  import { Check, Dots, Plus } from "tabler-icons-svelte";
  import { QAArtistAdd, type QueuedArtistAdd } from "typings_queue";
  import {
    ArtistIsAbsent,
    ArtistIsPresent,
    ArtistIsQueued,
    type MetadataProvider,
  } from "typings_struct";
  import { highlightSelect, searchTimeout } from "utils";

  let searchInput: HTMLInputElement;
  let selectedProvider: MetadataProvider;

  let searchResults: ReturnType<typeof API.searchArtists>;
  let lastSearched = "";
  function search(bypass = false) {
    if (!bypass && lastSearched == searchInput.value) return;
    if (!searchInput.value) return (searchResults = null as any);
    lastSearched = searchInput.value;
    searchResults = API.searchArtists(searchInput.value, selectedProvider);
  }

  let wasAdded: string[] = [];
  const i = API.onQueueChange((v) => {
    if (v.type == QAArtistAdd && v.is == "remove") {
      wasAdded = [...wasAdded, (<QueuedArtistAdd>JSON.parse(v.data)).id];
    }
  });

  onMount(() => {
    searchInput.select();
  });
  onDestroy(() => {
    API.offQueueChange(i);
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
            {#each artists as artist (artist.id)}
              <ArtistCard {artist}>
                <div
                  class="ml-auto mb-auto cursor-pointer"
                  on:click={async () => {
                    if (wasAdded.find((w) => Object.values(artist.providers).includes(w)))
                      artist.status = 2;
                    switch (artist.status) {
                      case ArtistIsPresent:
                        const d = await API.listArtists();
                        if (d.err) return;
                        navigate(
                          `/artists/${d.find((a) => a.name == artist.name)?.id || artist.id}/manage`
                        );
                        break;
                      case ArtistIsQueued:
                        document.getElementById("queueButton")?.focus();
                        break;
                      case ArtistIsAbsent:
                      default:
                        await API.post("artist_add", {
                          id: Object.entries(artist.providers)[0][1],
                          provider: Object.entries(artist.providers)[0][0],
                        });
                        artist.status = 1;
                        //@ts-ignore
                        artists = artists;
                    }
                  }}
                >
                  {#if artist.status == ArtistIsPresent || wasAdded.find( (w) => Object.values(artist.providers).includes(w) )}
                    <div class="text-success">
                      <Check size={40} />
                    </div>
                  {:else if artist.status == ArtistIsQueued}
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
