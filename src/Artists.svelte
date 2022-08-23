<script lang="ts">
  import { Plus } from "tabler-icons-svelte";
  import { link } from "svelte-routing";
  import Loader from "Loader.svelte";

  let artistPromise = new Promise<any[]>((res, rej) => {
    setTimeout(() => res([]), 5000);
  });
</script>

{#await artistPromise}
  <Loader />
{:then artists}
  <div class="flex gap-2 items-center">
    <div class="text-xl font-bold">{artists.length.toLocaleString()} Artists</div>
    <a class="btn btn-primary btn-square btn-outline btn-xs" href="/artists/add" use:link>
      <Plus size={20} />
    </a>
  </div>
{:catch}
  <div class="text-error">Error loading artists.</div>
{/await}
