<script lang="ts">
  import ArtistProviders from "ArtistProviders.svelte";
  import { API, config } from "index";
  import Loader from "Loader.svelte";
  import { offQueueChange, onQueueChange } from "queue";
  import { onDestroy } from "svelte";
  import { link, navigate } from "svelte-routing";
  import { ExternalLink } from "tabler-icons-svelte";
  import type { Album } from "../server/struct";

  export let id: string;

  let filteredLetter = "";
  function getLetters(artists: Album[]) {
    const allLetters = [...new Set(artists.map((l) => l.name[0].toUpperCase()))].sort();
    const filtered = allLetters.filter((l) => config.nonSymbol.includes(l));
    const ret = filtered.length !== allLetters.length ? ["#", ...filtered] : allLetters;
    if (!filteredLetter) filteredLetter = ret[0];
    return ret;
  }

  let albumSearchBar: HTMLInputElement;
  let albumSearch = "";
  let artistDetails = API.fetchArtist(id);
  let delButton: HTMLDivElement;

  const bari = setInterval(() => {
    if (!albumSearchBar) return;
    clearInterval(bari);
    albumSearchBar.focus();
  });
  const i = onQueueChange(async (e) => {
    if (e.type == "LibraryScan") {
      const d = await API.fetchArtist(id);
      artistDetails = new Promise((r) => r(d));
    }
  });
  onDestroy(() => {
    offQueueChange(i);
    clearInterval(bari);
  });

  let refreshMetaBtn: HTMLDivElement;
</script>

{#await artistDetails}
  <Loader />
{:then r}
  {#if r.err}
    <div class="text-sm">{r.message}</div>
  {:else}
    <div class="card w-3/4 bg-base-300 shadow-xl box-border m-auto">
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
                    .join("")}
                </span>
              </div>
            </div>
          {/if}
          <div class="flex flex-col gap-1 ml-1">
            <div class="flex items-center gap-1">
              <div class="text-3xl">{r.artist.name}</div>
              <a class="text-secondary" href={r.artist.url} target="_blank" rel="noreferrer"
                ><ExternalLink size={32} /></a
              >
            </div>
            <div class="flex gap-1">
              <div class="badge">
                Followers: {r.artist.followers.toLocaleString()}
              </div>
              <ArtistProviders providers={Object.keys(r.artist.providers)} size={20} />
            </div>
            <div class="flex gap-2 flex-wrap">
              {#each r.artist.genres as genre}
                <div class="badge badge-outline badge-md text-xs" style="padding:10px;">
                  {genre}
                </div>
              {/each}
            </div>
            <div class="flex gap-1 mt-2 flex-wrap">
              <div
                class="btn btn-sm btn-accent w-max"
                bind:this={refreshMetaBtn}
                on:click={async () => {
                  refreshMetaBtn.classList.add("loading");
                  for (const [source, id] of Object.entries(r.artist.providers)) {
                    await API.post("artist_add", { id, source });
                  }
                  refreshMetaBtn.classList.remove("loading");
                }}
              >
                Refresh Metadata
              </div>
              <div
                class="btn btn-sm btn-error w-max"
                bind:this={delButton}
                on:click={async () => {
                  if (confirm("Are you sure?")) {
                    delButton.classList.add("loading");
                    const res = await API.post("/artist_remove", {
                      id: r.artist.id,
                    });
                    delButton.classList.remove("loading");
                    if (!res.err) navigate("/artists");
                  }
                }}
              >
                Delete Artist
              </div>
            </div>
          </div>
        </h2>
        <div class="flex gap-3 items-center justify-center">
          <div class="font-bold w-max">
            {r.artist.albums.reduce(
              (a, b) => a + b.tracks.filter((t) => t.added).length,
              0
            )}/{r.artist.albums.reduce((a, b) => a + b.tracks.length, 0)}
            {" "}Tracks
          </div>
          <progress
            class="progress flex-1 {(() => {
              const len = r.artist.albums.reduce(
                (a, b) => a + b.tracks.filter((t) => t.added).length,
                0
              );
              if (len == r.artist.albums.reduce((a, b) => a + b.tracks.length, 0))
                return 'progress-success';
              else if (len == 0) return 'progress-error';
              else return 'progress-warning';
            })()}"
            value={r.artist.albums.reduce((a, b) => a + b.tracks.filter((t) => t.added).length, 0)}
            max={r.artist.albums.reduce((a, b) => a + b.tracks.length, 0)}
          />
        </div>
      </div>
    </div>
    <input
      type="text"
      placeholder="Search for an album..."
      class="input input-bordered w-5/6 block mx-auto my-2"
      bind:this={albumSearchBar}
      bind:value={albumSearch}
    />
    {#if !albumSearch}
      <div class="btn-group w-full justify-center mt-3">
        {#each getLetters(r.artist.albums) as letter}
          <button
            class="btn {filteredLetter == letter ? 'btn-active' : ''}"
            on:click={() => (filteredLetter = letter)}>{letter}</button
          >
        {/each}
      </div>
    {/if}
    <div class="flex gap-2 flex-wrap flex-row justify-center mt-3">
      {#each (albumSearch ? r.artist.albums
            .filter((a) => a.name.toLowerCase().includes(albumSearch.toLowerCase()))
            .slice(0, 15) : r.artist.albums.filter((a) => {
            if (config.nonSymbol.includes(filteredLetter)) return a.name
                .toUpperCase()
                .startsWith(filteredLetter);
            else return !config.nonSymbol.includes(a.name.toUpperCase()[0]);
          })).sort((a1, a2) => (a1.name.toLowerCase() > a2.name.toLowerCase() ? 1 : -1)) as album}
        <div class="card w-64 bg-base-300 shadow-xl">
          <figure>
            <img src={album.image} alt={album.name} class="w-full aspect-square" />
          </figure>
          <div class="card-body p-5">
            <h2 class="card-title">
              {album.name}
              <a class="text-secondary" href={album.url} target="_blank" rel="noreferrer"
                ><ExternalLink /></a
              >
            </h2>
            <div class="card-actions">
              <div class="badge badge-info">{album.type.toUpperCase()}</div>
              <div class="badge badge-accent">{album.year}</div>
              <ArtistProviders providers={[album.provider]} size={20} />
            </div>
            <div class="card-actions items-center mt-auto">
              <a
                class="btn btn-primary btn-sm"
                href={`/artists/${r.artist.id}/albums/${album.id}`}
                use:link>Manage</a
              >
              <div
                class={`ml-auto badge ${(() => {
                  const len = album.tracks.filter((t) => t.added).length;
                  if (len == album.tracks.length) return "badge-success";
                  else if (len == 0) return "badge-error";
                  else return "badge-warning";
                })()}`}
              >
                {album.tracks.filter((t) => t.added).length}/{album.tracks.length}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
{/await}
