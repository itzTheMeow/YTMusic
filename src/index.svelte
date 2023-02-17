<script lang="ts">
  import { Queue } from "APIClient";
  import ArtistAdd from "ArtistAdd.svelte";
  import ArtistAlbum from "ArtistAlbum.svelte";
  import ArtistManage from "ArtistManage.svelte";
  import Artists from "Artists.svelte";
  import { Auth } from "index";
  import { DateTime } from "luxon";
  import SettingsPage from "Settings.svelte";
  import { onDestroy, onMount } from "svelte";
  import { link, Route, Router } from "svelte-routing";
  import { ListSearch, Logout, Settings } from "tabler-icons-svelte";
  import type { QueueItem } from "typings_queue";
  import { decodeTime } from "ulid";
  import Home from "./Home.svelte";

  if (!Auth.isAuthorized) window.location.href = "/login";

  export let url = "";

  let nav: HTMLDivElement;
  let pageContent: HTMLDivElement;
  let q: QueueItem[] = [];
  Queue.subscribe((val) => (q = val));
  const setint = setInterval(() => (q = q), 900);

  onMount(() => {
    pageContent.style.height = `calc(100vh - ${nav.offsetHeight}px)`;
  });
  onDestroy(() => {
    clearInterval(setint);
  });
</script>

<div class="navbar bg-base-100" bind:this={nav}>
  <div class="navbar-start">
    <a href="/" class="btn btn-ghost normal-case text-xl" use:link>YTMusic</a>
    <ul class="menu menu-horizontal p-0">
      <li><a href="/artists" use:link>Artists</a></li>
    </ul>
  </div>
  <div class="navbar-end">
    <ul class="menu menu-horizontal p-0">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <div class="dropdown dropdown-end">
        <label class="btn btn-ghost btn-circle relative" id="queueButton">
          <ListSearch />
          {#if q.length}
            <div class="badge badge-primary absolute top-0 right-0">
              {q.length}
            </div>
          {/if}
        </label>
        <div
          class="mt-3 p-3 shadow menu menu-compact dropdown-content bg-base-200
            rounded-lg overflow-x-hidden w-max"
          style="max-width:30vw;max-height:50vh;"
        >
          {#if q.length}
            {#each q as qi (qi.id)}
              <div>
                <div class="badge badge-secondary badge-outline">{qi.type}</div>
                <div class="text-sm">
                  Added {DateTime.fromMillis(decodeTime(qi.id)).toRelative()}
                </div>
                <!-- TODO: add more details
              {#if qi.type == 'ArtistAdd'}
                <div>{qi.id}</div>
              {:else if qi.type == 'ArtistDelete'}
                <div>{qi.id}</div>
              {:else if qi.type == 'SongDownload'}
                <div>{qi.url}</div>
              {/if}
              -->
              </div>
            {/each}
          {:else}
            <div class="text-sm">Queue is empty!</div>
          {/if}
        </div>
      </div>
      <a class="btn btn-ghost btn-circle" href="/settings" use:link>
        <Settings />
      </a>
      <button class="btn btn-ghost btn-circle" on:click={() => Auth.logout()}>
        <Logout />
      </button>
    </ul>
  </div>
</div>

<div class="p-2 h-full" bind:this={pageContent}>
  <Router {url}>
    <Route path="/" component={Home} />
    <Route path="/artists" component={Artists} />
    <Route path="/artists/add" component={ArtistAdd} />
    <Route path="/artists/:id/manage" component={ArtistManage} />
    <Route path="/artists/:id/albums/:albid" component={ArtistAlbum} />
    <Route path="/settings" component={SettingsPage} />
  </Router>
</div>
