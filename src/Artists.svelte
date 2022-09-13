<script lang="ts">
  import { Plus, Settings } from "tabler-icons-svelte";
  import { link } from "svelte-routing";
  import Loader from "Loader.svelte";
  import { API } from "index";
  import ArtistCard from "ArtistCard.svelte";
  import { onDestroy } from "svelte";

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
      {artists.err ? 0 : artists.list.length.toLocaleString()} Artists
    </div>
    <a
      class="btn btn-primary btn-square btn-outline btn-sm"
      href="/artists/add"
      use:link>
      <Plus size={32} />
    </a>
    <input
      type="text"
      placeholder="Search for an artist..."
      class="input input-bordered w-1/3 block ml-auto"
      bind:this={artistSearchBar}
      bind:value={artistSearch} />
  </div>
  {#if artists.err}
    <div class="text-sm">{artists.message}</div>
  {:else}
    <div class="flex flex-row flex-wrap gap-4 justify-center mt-3">
      {#each artistSearch ? artists.list.filter((a) =>
            a.name.toLowerCase().includes(artistSearch.toLowerCase())
          ) : artists.list as artist}
        <ArtistCard {artist}>
          <a
            class="ml-auto mb-auto cursor-pointer"
            href={`/artists/${artist.id}/manage`}
            use:link>
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
