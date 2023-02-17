<script lang="ts">
  import ProviderIcon from "ProviderIcon.svelte";
  import type { MetadataProvider } from "typings_struct";
  import { Providers } from "utils";

  export let size = 18;
  export let providers: (MetadataProvider | string)[];

  let provs: MetadataProvider[];
  $: provs = providers as any;
</script>

{#each provs as p}
  <div style="color:{Providers[p]};">
    <ProviderIcon {size} provider={p} />
  </div>
{/each}
