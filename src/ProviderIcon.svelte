<script lang="ts">
  import {
    IconBrandBandlab,
    IconBrandSoundcloud,
    IconBrandSpotify,
    IconBrandYoutube,
    IconLetterK,
    IconMusic,
  } from "@tabler/icons-svelte";
  import {
    MetaProviderBandLab,
    MetaProviderKonami,
    MetaProviderSoundCloud,
    MetaProviderSpotify,
    SoundProviderSoundCloud,
    SoundProviderYouTube,
    type MetadataProvider,
    type SoundProvider,
  } from "typings_struct";

  export let size = 18;
  export let provider: MetadataProvider | SoundProvider;
</script>

{#if provider == MetaProviderSpotify}
  <IconBrandSpotify {size} />
{:else if provider == MetaProviderSoundCloud || provider == SoundProviderSoundCloud}
  <IconBrandSoundcloud {size} />
{:else if provider == MetaProviderKonami}
  <IconLetterK {size} />
{:else if provider == MetaProviderBandLab}
  <IconBrandBandlab {size} />
{:else if provider == SoundProviderYouTube}
  <IconBrandYoutube {size} />
{:else}
  <IconMusic {size} />
{/if}
