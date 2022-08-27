<script lang="ts">
  import { API } from "index";
  import Loader from "Loader.svelte";

  let scanButton: HTMLDivElement;
  let libraryFolder: HTMLInputElement;

  const settingsP = API.getSettings();
</script>

{#await settingsP}
  <Loader />
{:then res}
  {#if res.err}
    <div class="text-sm">{res.message}</div>
  {:else}
    <div
      class="btn btn-primary btn-sm"
      bind:this={scanButton}
      on:click={async () => {
        scanButton.classList.add('loading');
        await API.post('scan_lib', {});
        scanButton.classList.remove('loading');
      }}>
      Scan Library
    </div>
    <div class="text-md font-semibold mb-1 mt-2">Library Folder</div>
    <div class="flex items-center">
      <input
        type="text"
        placeholder="/home/Music"
        class="input input-bordered w-72"
        value={res.settings.libraryFolder}
        bind:this={libraryFolder}
        on:keyup={async () => {
          libraryFolder.classList.remove('input-error');
          if (libraryFolder.value) {
            //@ts-ignore
            libraryFolder.nextElementSibling.style.display = 'block';
            await API.setSetting('libraryFolder', libraryFolder.value);
            //@ts-ignore
            libraryFolder.nextElementSibling.style.display = '';
          } else {
            libraryFolder.classList.add('input-error');
          }
        }} />
      <div class="hidden w-max h-max">
        <Loader />
      </div>
    </div>
  {/if}
{/await}
