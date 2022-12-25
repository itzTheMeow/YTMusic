<script lang="ts">
  import ProviderIcon from "ProviderIcon.svelte";
  import { Providers } from "utils";
  import type { MetadataProviders } from "../server/struct";

  export let size = 18;
  export let providers: (MetadataProviders | string)[];

  let provs: MetadataProviders[];
  $: provs = providers as any;
</script>

{#each provs as p}
  <div style="color:{Providers[p]};">
    <ProviderIcon {size} provider={p} />
  </div>
{/each}
