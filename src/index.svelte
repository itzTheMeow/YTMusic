<script lang="ts">
  let time = "";
  setInterval(() => (time = new Date().toLocaleTimeString()), 900);
</script>

<p>Whats up, Svelte. Current time: {time || "Loading..."}</p>

<style>
  p {
    font-size: 1.5rem;
  }
</style>
