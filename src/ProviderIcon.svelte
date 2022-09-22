<script lang="ts">
  import {
    BrandSoundcloud,
    BrandSpotify,
    LetterK,
    Music,
  } from "tabler-icons-svelte";

  import { MetadataProviders } from "../server/struct";

  export let size = 18;
  export let provider: MetadataProviders;
</script>

{#if provider == MetadataProviders.Spotify}
  <BrandSpotify {size} />
{:else if provider == MetadataProviders.SoundCloud}
  <BrandSoundcloud {size} />
{:else if provider == MetadataProviders.Konami}
  <LetterK {size} />
{:else}
  <Music {size} />
{/if}
