<script lang="ts">
  import { API, Auth } from "index";
  import Loader from "ui/Loader.svelte";
  import { Themes } from "Theme";
  import ThemePreview from "ThemePreview.svelte";

  let scanButton: HTMLDivElement;
  let libraryFolder: HTMLInputElement, pipedAPI: HTMLInputElement;

  const settingsP = API.getSettings();

  let curPass = "";
  let newPass = "";
  let newPassConfirm = "";
  let changeError = "";
  let passSubmit: HTMLDivElement;
  async function handlePassChange() {
    changeError = "";
    if (!curPass || !newPass) return (changeError = "Please enter a password.");
    if (newPass !== newPassConfirm) return (changeError = "Your passwords do not match!");
    passSubmit.classList.add("loading");
    const changed = await API.changePassword(curPass, newPass);
    passSubmit.classList.remove("loading");
    if (changed.err) return (changeError = changed.message!);
    Auth.logout();
  }
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
        scanButton.classList.add("loading");
        await API.post("scan_lib", {});
        scanButton.classList.remove("loading");
      }}
    >
      Scan Library
    </div>
    <div class="text-md font-semibold mb-1 mt-2">Library Folder</div>
    <div class="flex items-center">
      <input
        type="text"
        placeholder="/home/Music"
        class="input input-bordered w-72"
        value={res.libraryFolder}
        bind:this={libraryFolder}
        on:keyup={async () => {
          libraryFolder.classList.remove("input-error");
          if (libraryFolder.value) {
            //@ts-ignore
            libraryFolder.nextElementSibling.style.display = "block";
            await API.setSetting("libraryFolder", libraryFolder.value);
            //@ts-ignore
            libraryFolder.nextElementSibling.style.display = "";
          } else {
            libraryFolder.classList.add("input-error");
          }
        }}
      />
      <div class="hidden w-max h-max">
        <Loader />
      </div>
    </div>
    <div class="text-md font-semibold mb-1 mt-2">Piped API</div>
    <div class="flex items-center">
      <input
        type="text"
        placeholder="https://pipedapi.kavin.rocks"
        class="input input-bordered w-72"
        value={res.pipedAPI}
        bind:this={pipedAPI}
        on:keyup={async () => {
          pipedAPI.classList.remove("input-error");
          if (pipedAPI.value) {
            //@ts-ignore
            pipedAPI.nextElementSibling.style.display = "block";
            await API.setSetting("pipedAPI", pipedAPI.value);
            //@ts-ignore
            pipedAPI.nextElementSibling.style.display = "";
          } else {
            pipedAPI.classList.add("input-error");
          }
        }}
      />
      <div class="hidden w-max h-max">
        <Loader />
      </div>
    </div>
    <div class="text-md font-semibold mb-1 mt-2">Change Password</div>
    <div class="flex items-center gap-2">
      <input
        type="password"
        placeholder="Current Password"
        class="input input-bordered w-44"
        bind:value={curPass}
      />
      <input
        type="password"
        placeholder="New Password"
        class="input input-bordered w-44"
        bind:value={newPass}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        class="input input-bordered w-44"
        bind:value={newPassConfirm}
      />
      <div class="btn btn-secondary" bind:this={passSubmit} on:click={handlePassChange}>Change</div>
      <div class="text-sm text-error">{changeError}</div>
    </div>
    <div class="text-md font-semibold mb-1 mt-2">Theme</div>
    <div
      class="rounded-box grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4
        lg:grid-cols-5"
    >
      {#each Themes as theme}
        <ThemePreview {theme} />
      {/each}
    </div>
  {/if}
{/await}
