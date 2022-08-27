<script lang="ts">
  import ArtistCard from "ArtistCard.svelte";
  import { API } from "index";
  import Loader from "Loader.svelte";
  import { Queue } from "queue";

  import { onDestroy, onMount } from "svelte";
  import { Check, Dots, Plus } from "tabler-icons-svelte";
  import { MetadataProviders } from "../server/struct";
  import { navigate } from "svelte-routing";

  let searchInput: HTMLInputElement;
  let wantSearch = false;
  let inputSelected = true;

  let searchResults: ReturnType<typeof API.searchSpotify>;
  let lastSearched = "";
  function search() {
    if (lastSearched == searchInput.value) return;
    lastSearched = searchInput.value;
    searchResults = API.searchSpotify(searchInput.value);
  }

  let beingAdded = new Set<string>();
  let wasAdded: string[] = [];
  Queue.subscribe((val) => {
    val.forEach((v) => {
      if (v.type == "ArtistAdd") beingAdded.add(v.id);
    });
    [...beingAdded].forEach((b) => {
      if (!val.find((v) => v.type == "ArtistAdd" && v.id == b)) {
        wasAdded = [...wasAdded, b];
        beingAdded.delete(b);
      }
    });
    console.log(beingAdded, wasAdded);
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
    clearInterval(searchCheck);
  });
</script>

<div class="flex flex-col">
  <div class="flex flex-col">
    <div class="text-lg w-full max-w-3xl m-auto pl-2">Add an Artist</div>
    <input
      type="text"
      placeholder="Search for a spotify artist..."
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
      }} />
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
                  if (wasAdded.includes(artist.id)) artist.status = 2;
                  switch (artist.status) {
                    case 2:
                      navigate(`/artists/${artist.id}/manage`);
                      break;
                    case 1: //@ts-ignore
                      document.getElementById('queueButton').focus();
                      break;
                    default:
                      await API.post('artist_add', {
                        id: artist.id,
                        source: MetadataProviders.Spotify,
                      });
                      artist.status = 1;
                      artists = artists;
                  }
                }}>
                {#if artist.status == 2 || wasAdded.includes(artist.id)}
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
