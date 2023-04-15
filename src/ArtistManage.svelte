<script lang="ts">
  import { IconExternalLink } from "@tabler/icons-svelte";
  import ArtistProviders from "ArtistProviders.svelte";
  import { API, config } from "index";
  import Loader from "Loader.svelte";
  import { onDestroy } from "svelte";
  import { link, navigate } from "svelte-routing";
  import { QALibraryScan } from "typings_queue";
  import type { Album } from "typings_struct";

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
  const i = API.onQueueChange(async (e) => {
    if (e.type == QALibraryScan && e.is == "remove") {
      const d = await API.fetchArtist(id);
      artistDetails = new Promise((r) => r(d));
    }
  });
  onDestroy(() => {
    API.offQueueChange(i);
    clearInterval(bari);
  });

  let refreshMetaBtn: HTMLDivElement;
</script>

{#await artistDetails}
  <Loader />
{:then artist}
  {#if artist.err || !artist.albums}
    <div class="text-sm">{"message" in artist ? artist.message : "Error"}</div>
  {:else}
    <div class="card w-3/4 bg-base-300 shadow-xl box-border m-auto">
      <div class="card-body">
        <h2 class="card-title flex-wrap">
          {#if artist.icon}
            <div class="avatar">
              <div class="w-36 rounded">
                <img src={artist.icon} alt={artist.name} id={artist.id} />
              </div>
            </div>
          {:else}
            <div class="avatar placeholder">
              <div class="w-36 rounded bg-neutral-focus text-neutral-content">
                <span class="text-lg">
                  {artist.name
                    .split(/ +/g)
                    .map((a) => a[0].toUpperCase())
                    .join("")}
                </span>
              </div>
            </div>
          {/if}
          <div class="flex flex-col gap-1 ml-1">
            <div class="flex items-center gap-1">
              <div class="text-3xl">{artist.name}</div>
              <a class="text-secondary" href={artist.url} target="_blank" rel="noreferrer"
                ><IconExternalLink size={32} /></a
              >
            </div>
            <div class="flex gap-1">
              <div class="badge">
                Followers: {artist.followers.toLocaleString()}
              </div>
              <ArtistProviders providers={Object.keys(artist.providers)} size={20} />
            </div>
            <div class="flex gap-2 flex-wrap">
              {#each artist.genres as genre}
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
                  for (const [provider, id] of Object.entries(artist.providers)) {
                    await API.post("artist_add", { id, provider });
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
                      id: artist.id,
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
            {artist.albums.reduce(
              (a, b) => a + b.tracks.filter((t) => t.added).length,
              0
            )}/{artist.albums.reduce((a, b) => a + b.tracks.length, 0)}
            {" "}Tracks
          </div>
          <progress
            class="progress flex-1 {(() => {
              const len = artist.albums.reduce(
                (a, b) => a + b.tracks.filter((t) => t.added).length,
                0
              );
              if (len == artist.albums.reduce((a, b) => a + b.tracks.length, 0))
                return 'progress-success';
              else if (len == 0) return 'progress-error';
              else return 'progress-warning';
            })()}"
            value={artist.albums.reduce((a, b) => a + b.tracks.filter((t) => t.added).length, 0)}
            max={artist.albums.reduce((a, b) => a + b.tracks.length, 0)}
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
        {#each getLetters(artist.albums) as letter}
          <button
            class="btn {filteredLetter == letter ? 'btn-active' : ''}"
            on:click={() => (filteredLetter = letter)}>{letter}</button
          >
        {/each}
      </div>
    {/if}
    <div class="flex gap-2 flex-wrap flex-row justify-center mt-3">
      {#each (albumSearch ? artist.albums
            .filter((a) => a.name.toLowerCase().includes(albumSearch.toLowerCase()))
            .slice(0, 15) : artist.albums.filter((a) => {
            if (config.nonSymbol.includes(filteredLetter)) return a.name
                .toUpperCase()
                .startsWith(filteredLetter);
            else return !config.nonSymbol.includes(a.name.toUpperCase()[0]);
          })).sort( (a1, a2) => (a1.name.toLowerCase() > a2.name.toLowerCase() ? 1 : -1) ) as album (album.id)}
        <div class="card w-64 bg-base-300 shadow-xl">
          <figure>
            <img src={album.image} alt={album.name} class="w-full aspect-square" />
          </figure>
          <div class="card-body p-5">
            <h2 class="card-title">
              {album.name}
              <a class="text-secondary" href={album.url} target="_blank" rel="noreferrer"
                ><IconExternalLink /></a
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
                href={`/artists/${artist.id}/albums/${album.id}`}
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
