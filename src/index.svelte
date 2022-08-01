<script lang="ts">
  let time = "";
  setInterval(() => (time = new Date().toLocaleTimeString()), 900);
</script>

<p>Whats up, Svelte. Current time: <span>{time || "Loading..."}</span></p>

<style lang="scss">
  p {
    font-size: 1.5rem;

    span {
      font-weight: bold;
    }
  }
</style>
