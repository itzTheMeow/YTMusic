<script lang="ts">
  import ProviderIcon from "ProviderIcon.svelte";
  import { createEventDispatcher } from "svelte";
  import { Providers } from "utils";
  import { MetadataProviders, SoundProviders } from "../server/struct";

  export let type: "meta" | "sound";
  export let className = "";
  export let select: MetadataProviders | SoundProviders | undefined = undefined;

  // https://stackoverflow.com/questions/46432335/hex-to-hsl-convert-javascript
  function hex2hsl(prov: MetadataProviders | SoundProviders) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(Providers[prov])!;
    let r = parseInt(result[1], 16),
      g = parseInt(result[2], 16),
      b = parseInt(result[3], 16);
    (r /= 255), (g /= 255), (b /= 255);
    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s,
      l = (max + min) / 2;
    if (max == min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    s = s * 100;
    s = Math.round(s);
    l = l * 100;
    l = Math.round(l);
    h = Math.round(360 * h);
    return `${h} ${s}% ${l}%`;
  }

  export let selected: MetadataProviders | SoundProviders =
    (type == "meta"
      ? Object.values(MetadataProviders).find((e) => e == select)
      : Object.values(SoundProviders).find((e) => e == select)) ||
    (type == "meta" ? MetadataProviders.Spotify : SoundProviders.YouTube);
  const dispatch = createEventDispatcher();
</script>

<div class="btn-group justify-center {className}">
  {#each Object.values(type == "meta" ? MetadataProviders : SoundProviders) as prov}
    <button
      class="btn {selected == prov ? 'btn-active' : ''}"
      style={`--${selected == prov ? "p" : "nc"}:${hex2hsl(prov)};`}
      on:click={() => ((selected = prov), dispatch("selection"))}
    >
      <ProviderIcon size={26} provider={prov} />
    </button>
  {/each}
</div>
