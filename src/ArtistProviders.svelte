<script lang="ts">
  import ProviderIcon from "ProviderIcon.svelte";
  import { getProviders, Providers } from "utils";

  export let size = 18;
  export let providers: string[];
</script>

{#each getProviders(providers) as p}
  <div style="color:{Providers[p]};">
    <ProviderIcon {size} provider={p} />
  </div>
{/each}
