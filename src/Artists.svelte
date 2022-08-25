<script lang="ts">
  import { Plus, Settings } from "tabler-icons-svelte";
  import { link } from "svelte-routing";
  import Loader from "Loader.svelte";
  import { API } from "index";
  import type { Artist } from "../server/struct";
  import ArtistCard from "ArtistCard.svelte";

  let artistPromise = API.listArtists();
</script>

{#await artistPromise}
  <Loader />
{:then artists}
  <div class="flex gap-2 items-center justify-center">
    <div class="text-3xl font-bold">
      {artists.err ? 0 : artists.list.length.toLocaleString()} Artists
    </div>
    <a
      class="btn btn-primary btn-square btn-outline btn-sm"
      href="/artists/add"
      use:link>
      <Plus size={32} />
    </a>
  </div>
  {#if artists.err}
    <div class="text-sm">{artists.message}</div>
  {:else}
    <div class="flex flex-row flex-wrap gap-4 justify-center mt-3">
      {#each artists.list as artist}
        <ArtistCard {artist}>
          <div
            class="ml-auto mb-auto cursor-pointer"
            on:click={async () => {
              alert('ok');
            }}>
            <div class="text-primary">
              <Settings size={40} />
            </div>
          </div>
        </ArtistCard>
      {/each}
    </div>
  {/if}
{:catch}
  <div class="text-error">Error loading artists.</div>
{/await}
