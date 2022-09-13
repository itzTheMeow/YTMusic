<script lang="ts">
  import ArtistProviders from "ArtistProviders.svelte";
  import { ExternalLink } from "tabler-icons-svelte";
  import type { Artist } from "../server/struct";

  export let artist: Artist;
</script>

<div class="card w-96 bg-base-200 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">
      <div class="avatar {!artist.icon ? 'placeholder' : ''}">
        {#if artist.icon}
          <div class="w-20 rounded">
            <img src={artist.icon} alt={artist.name} id={artist.id} />
          </div>
        {:else}
          <div class="w-20 rounded bg-neutral-focus text-neutral-content">
            <span class="text-md">
              {artist.name
                .split(/ +/g)
                .map((a) => a[0].toUpperCase())
                .join('')}
            </span>
          </div>
        {/if}
        <div
          class="absolute -top-1.5 -right-1.5 bg-base-200 rounded-full p-0.5
            !flex !aspect-auto gap-0.5">
          <ArtistProviders providers={artist.providers} />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1">
          <div>{artist.name}</div>
          <a
            class="text-secondary"
            href={artist.url}
            target="_blank"><ExternalLink /></a>
        </div>
        <div class="badge">{artist.followers.toLocaleString()}</div>
      </div>
      <slot />
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
