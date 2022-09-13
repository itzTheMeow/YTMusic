<script lang="ts">
  import { BrandSoundcloud, BrandSpotify, Music } from "tabler-icons-svelte";

  import { getProviders, Providers } from "utils";
  import { MetadataProviders } from "../server/struct";

  export let size = 18;
  export let providers: string[];
</script>

{#each getProviders(providers) as p}
  <div style="color:{Providers[p]};">
    {#if p == MetadataProviders.Spotify}
      <BrandSpotify {size} />
    {:else if p == MetadataProviders.SoundCloud}
      <BrandSoundcloud {size} />
    {:else}
      <Music {size} />
    {/if}
  </div>
{/each}
