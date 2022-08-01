<script lang="ts">
  import {
    Content,
    Header,
    HeaderGlobalAction,
    HeaderUtilities,
    Theme,
  } from "carbon-components-svelte";
  import { LogoYoutube } from "carbon-icons-svelte";
  import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
  let theme: "white" | "g10" | "g80" | "g90" | "g100" = "g90";

  let time = "";
  setInterval(() => (time = new Date().toLocaleTimeString()), 900);
</script>

<Theme bind:theme persist persistKey="theme" />
<Header>
  <svelte:fragment slot="platform">{LogoYoutube} YTMusic</svelte:fragment>
  <HeaderUtilities>
    <HeaderGlobalAction aria-label="Settings" icon={SettingsAdjust} />
  </HeaderUtilities>
</Header>

<Content><p>Whats up, Svelte. Current time: <span>{time || "Loading..."}</span></p></Content>

<style lang="scss">
  p {
    font-size: 1.5rem;

    span {
      font-weight: bold;
    }
  }
</style>
