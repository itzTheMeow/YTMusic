<script lang="ts">
  import { API } from "index";
  import Loader from "Loader.svelte";

  import { onDestroy, onMount } from "svelte";
  import { ExternalLink, Plus } from "tabler-icons-svelte";
  import type { Artist } from "../server/struct";

  let searchInput: HTMLInputElement;
  let wantSearch = false;
  let inputSelected = true;

  let searchResults: Promise<Artist[]> | null = null;
  let lastSearched = "";
  function search() {
    if (lastSearched == searchInput.value) return;
    lastSearched = searchInput.value;
    searchResults = API.searchSpotify(searchInput.value);
  }

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
        searchWaiting = setTimeout(search, 700);
      }}
    />
  </div>

  {#if searchResults}
    {#await searchResults}
      <Loader />
    {:then artists}
      <div class="flex flex-row flex-wrap gap-4 justify-center mt-3">
        {#each artists as artist}
          <div class="card w-96 bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">
                {#if artist.icon}
                  <div class="avatar">
                    <div class="w-20 rounded">
                      <img src={artist.icon} alt={artist.name} id={artist.id} />
                    </div>
                  </div>
                {:else}
                  <div class="avatar placeholder">
                    <div class="w-20 rounded bg-neutral-focus text-neutral-content">
                      <span class="text-md">
                        {artist.name
                          .split(/ +/g)
                          .map((a) => a[0].toUpperCase())
                          .join("")}
                      </span>
                    </div>
                  </div>
                {/if}
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1">
                    <div>{artist.name}</div>
                    <a class="text-secondary" href={artist.url} target="_blank"><ExternalLink /></a>
                  </div>
                  <div class="badge">{artist.followers.toLocaleString()}</div>
                </div>
                <div
                  class="text-primary ml-auto mb-auto cursor-pointer hover:text-success"
                  on:click={() => {
                    alert("ok");
                  }}
                >
                  <Plus size={40} />
                </div>
              </h2>
              <div class="card-actions justify-start">
                {#each artist.genres as genre}
                  <div class="badge badge-outline badge-md text-xs" style="padding:10px;">
                    {genre}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/await}
  {/if}
</div>
