<script lang="ts">
  import {
    Content,
    Header,
    HeaderGlobalAction,
    HeaderUtilities,
    Theme,
  } from "carbon-components-svelte";
  import { SettingsAdjust } from "carbon-icons-svelte";
  import { Router, Route, navigate, link } from "svelte-routing";
  import Home from "Home.svelte";
  let theme: "white" | "g10" | "g80" | "g90" | "g100" = "g90";

  export let url = "";
  let head: HTMLAnchorElement;
</script>

<Theme bind:theme persist persistKey="theme" />
<Header ref={head}>
  <a slot="platform" href="/" use:link>YTMusic</a>
  <HeaderUtilities>
    <HeaderGlobalAction
      aria-label="Settings"
      icon={SettingsAdjust}
      on:click={() => navigate('/settings')} />
  </HeaderUtilities>
</Header>

<Content>
  <Router {url}>
    <Route path="/" component={Home} />
  </Router>
</Content>
