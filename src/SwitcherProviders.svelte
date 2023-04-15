<script lang="ts">
  import ProviderIcon from "ProviderIcon.svelte";
  import { createEventDispatcher } from "svelte";
  import tinycolor from "tinycolor2";
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
  import { Providers } from "utils";

  export let type: "meta" | "sound";
  export let className = "";
  export let select: MetadataProvider | SoundProvider | undefined = undefined;

  const MetaList = [
      MetaProviderSpotify,
      MetaProviderSoundCloud,
      MetaProviderKonami,
      MetaProviderBandLab,
    ],
    SoundList = [SoundProviderYouTube, SoundProviderSoundCloud];

  export let selected: MetadataProvider | SoundProvider =
    (type == "meta" ? MetaList.find((m) => m == select) : SoundList.find((s) => s == select)) ||
    (type == "meta" ? MetaProviderSpotify : SoundProviderYouTube);
  const dispatch = createEventDispatcher();
</script>

<div class="btn-group justify-center {className}">
  {#each Object.values(type == "meta" ? MetaList : SoundList) as prov}
    <button
      class="btn {selected == prov ? 'btn-active' : ''}"
      style={`--${selected == prov ? "p" : "nc"}:${tinycolor(Providers[prov])
        .toHslString()
        .replace("hsl(", "")
        .replace(")", "")
        .replace(/,/g, "")};`}
      on:click={() => ((selected = prov), dispatch("selection"))}
    >
      <ProviderIcon size={26} provider={prov} />
    </button>
  {/each}
</div>
