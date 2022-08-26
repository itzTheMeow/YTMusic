<script lang="ts">
  import { API } from "index";
  import Loader from "Loader.svelte";
  import { navigate } from "svelte-routing";
  import { ExternalLink } from "tabler-icons-svelte";

  export let id: string;

  const artistDetails = API.fetchArtist(id);
  let delButton: HTMLDivElement;
</script>

{#await artistDetails}
  <Loader />
{:then r}
  {#if r.err}
    <div class="text-sm">{r.message}</div>
  {:else}
    <div class="card w-3/4 bg-base-200 shadow-xl box-border m-auto">
      <div class="card-body">
        <h2 class="card-title flex-wrap">
          {#if r.artist.icon}
            <div class="avatar">
              <div class="w-36 rounded">
                <img src={r.artist.icon} alt={r.artist.name} id={r.artist.id} />
              </div>
            </div>
          {:else}
            <div class="avatar placeholder">
              <div class="w-36 rounded bg-neutral-focus text-neutral-content">
                <span class="text-lg">
                  {r.artist.name
                    .split(/ +/g)
                    .map((a) => a[0].toUpperCase())
                    .join('')}
                </span>
              </div>
            </div>
          {/if}
          <div class="flex flex-col gap-1 ml-1">
            <div class="flex items-center gap-1">
              <div class="text-3xl">{r.artist.name}</div>
              <a
                class="text-secondary"
                href={r.artist.url}
                target="_blank"><ExternalLink size={32} /></a>
            </div>
            <div class="badge">
              Followers: {r.artist.followers.toLocaleString()}
            </div>
            <div class="flex gap-2 flex-wrap">
              {#each r.artist.genres as genre}
                <div
                  class="badge badge-outline badge-md text-xs"
                  style="padding:10px;">
                  {genre}
                </div>
              {/each}
            </div>
            <div class="flex gap-1 mt-2 flex-wrap">
              <div class="btn btn-sm btn-accent w-max btn-disabled">
                Refresh Metadata
              </div>
              <div
                class="btn btn-sm btn-error w-max"
                bind:this={delButton}
                on:click={async () => {
                  if (confirm('Are you sure?')) {
                    delButton.classList.add('loading');
                    const res = await API.post('/artist_remove', {
                      id: r.artist.id,
                    });
                    delButton.classList.remove('loading');
                    if (!res.err) navigate('/artists');
                  }
                }}>
                Delete Artist
              </div>
            </div>
          </div>
        </h2>
      </div>
    </div>
  {/if}
{/await}
