<script lang="ts">
  import { ListSearch, Logout, Settings } from "tabler-icons-svelte";
  import { link, Route, Router } from "svelte-routing";
  import Home from "./Home.svelte";
  import { Auth } from "index";

  if (!Auth.isAuthorized) window.location.href = "/login";

  export let url = "";
</script>

<div class="navbar bg-base-100">
  <div class="navbar-start">
    <a href="/" class="btn btn-ghost normal-case text-xl" use:link>YTMusic</a>
    <ul class="menu menu-horizontal p-0">
      <li><a href="/artists" use:link>Artists</a></li>
    </ul>
  </div>
  <div class="navbar-end">
    <ul class="menu menu-horizontal p-0">
      <a class="btn btn-ghost btn-circle" href="/" use:link>
        <ListSearch />
      </a>
      <a class="btn btn-ghost btn-circle" href="/settings" use:link>
        <Settings />
      </a>
      <button class="btn btn-ghost btn-circle" on:click={() => Auth.logout()}>
        <Logout />
      </button>
    </ul>
  </div>
</div>

<Router {url}>
  <Route path="/" component={Home} />
</Router>
