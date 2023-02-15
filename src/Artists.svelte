<script lang="ts">
  import ArtistCard from "ArtistCard.svelte";
  import { API, config } from "index";
  import Loader from "Loader.svelte";
  import { onDestroy } from "svelte";
  import { link } from "svelte-routing";
  import { Plus, Settings } from "tabler-icons-svelte";
  import type { Artist } from "typings_struct";

  let filteredLetter = "";
  function getLetters(artists: Artist[]) {
    const allLetters = [...new Set(artists.map((l) => l.name[0].toUpperCase()))].sort();
    const filtered = allLetters.filter((l) => config.nonSymbol.includes(l));
    const ret = filtered.length !== allLetters.length ? ["#", ...filtered] : allLetters;
    if (!filteredLetter) filteredLetter = ret[0];
    return ret;
  }

  let artistSearchBar: HTMLInputElement;
  let artistSearch = "";

  let artistPromise = API.listArtists();

  const bari = setInterval(() => {
    if (!artistSearchBar) return;
    clearInterval(bari);
    artistSearchBar.focus();
  });
  onDestroy(() => clearInterval(bari));
</script>

{#await artistPromise}
  <Loader />
{:then artists}
  <div class="flex gap-2 items-center w-5/6 mx-auto">
    <div class="text-3xl font-bold">
      {artists.err ? 0 : artists.length.toLocaleString()} Artists
    </div>
    <a class="btn btn-primary btn-square btn-outline btn-sm" href="/artists/add" use:link>
      <Plus size={32} />
    </a>
    <input
      type="text"
      placeholder="Search for an artist..."
      class="input input-bordered w-1/3 block ml-auto"
      bind:this={artistSearchBar}
      bind:value={artistSearch}
    />
  </div>
  {#if artists.err}
    <div class="text-sm">{artists.message}</div>
  {:else}
    {#if !artistSearch}
      <div class="btn-group w-full justify-center mt-4">
        {#each getLetters(artists) as letter}
          <button
            class="btn {filteredLetter == letter ? 'btn-active' : ''}"
            on:click={() => (filteredLetter = letter)}>{letter}</button
          >
        {/each}
      </div>
    {/if}
    <div class="flex flex-row flex-wrap gap-4 justify-center mt-3">
      {#each artistSearch ? artists
            .filter((a) => a.name.toLowerCase().includes(artistSearch.toLowerCase()))
            .slice(0, 15) : artists.filter((a) => {
            if (config.nonSymbol.includes(filteredLetter)) return a.name
                .toUpperCase()
                .startsWith(filteredLetter);
            else return !config.nonSymbol.includes(a.name.toUpperCase()[0]);
          }) as artist (artist.id)}
        <ArtistCard {artist}>
          <a class="ml-auto mb-auto cursor-pointer" href={`/artists/${artist.id}/manage`} use:link>
            <div class="text-primary">
              <Settings size={40} />
            </div>
          </a>
        </ArtistCard>
      {/each}
    </div>
  {/if}
{:catch}
  <div class="text-error">Error loading artists.</div>
{/await}
