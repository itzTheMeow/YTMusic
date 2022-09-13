<script lang="ts">
  import { onMount } from "svelte";

  import { API, Auth, config } from "./index";
  import Logo from "./logo.png";

  if (Auth.isAuthorized) window.location.href = "/";

  let Username: HTMLInputElement;
  let Password: HTMLInputElement;
  let Submit: HTMLButtonElement;
  let ERROR = "";

  async function login() {
    ERROR = "";
    if (!Username.value) {
      ERROR = "Please enter a username!";
      return Username.classList.add("input-error");
    }
    Username.classList.remove("input-error");
    if (!Password.value) {
      ERROR = "Please enter a password!";
      return Password.classList.add("input-error");
    }
    Password.classList.remove("input-error");

    Submit.classList.add("loading");
    const res = await API.login(Username.value, Password.value);
    Submit.classList.remove("loading");
    if (res.err) return (ERROR = res.message);
    Auth.getAuthorized(res.token);
  }

  onMount(() => Username.select());
</script>

<div class="flex flex-col items-center justify-center h-screen">
  <img src={Logo} alt={config.brandName} class="w-24 mb-1" />
  <div class="text-3xl font-bold mb-3">{config.brandName}</div>
  <input
    type="text"
    placeholder="Username"
    class="input input-bordered input-primary w-full max-w-xs block mb-1"
    bind:this={Username}
    on:keydown={(e) => e.key == 'Enter' && login()} />
  <input
    type="password"
    placeholder="Password"
    class="input input-bordered input-primary w-full max-w-xs block mb-3"
    bind:this={Password}
    on:keydown={(e) => e.key == 'Enter' && login()} />
  <div class="text-error mb-2 text-sm">{ERROR}</div>
  <button class="btn btn-primary mb-2" on:click={login} bind:this={Submit}>Log
    In</button>
  <div class="text-xs">
    Don't have an account? Contact your administrator to get one.
  </div>
</div>
