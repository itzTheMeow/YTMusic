<script lang="ts">
  import { onMount } from "svelte";
  import { ListSearch, Logout, Settings } from "tabler-icons-svelte";
  import { link, Route, Router } from "svelte-routing";
  import Home from "./Home.svelte";
  import { Auth } from "index";
  import Artists from "Artists.svelte";
  import ArtistAdd from "ArtistAdd.svelte";

  if (!Auth.isAuthorized) window.location.href = "/login";

  export let url = "";

  let nav: HTMLDivElement;
  let pageContent: HTMLDivElement;

  onMount(() => {
    pageContent.style.height = `calc(100vh - ${nav.offsetHeight}px)`;
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
      <div class="dropdown dropdown-end">
        <div tabindex="0" class="btn btn-ghost btn-circle">
          <ListSearch />
        </div>
        <div
          tabindex="0"
          class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-200 rounded-box w-52"
        >
          queue view goes here
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
  </Router>
</div>
