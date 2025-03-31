<script lang="ts">
	import {onMount} from 'svelte';
	// import type {Episode} from '@src/stores/searchResult.svelte';
	import {goto} from '$app/navigation';

	let {item} = $props();

	// let episode: Episode = $state({data: {}});

	onMount(() => {
		// imdbApi.getInfoOnEpisode(imdbId, seasonNumber, episodeNumber).then((result) => {
		//     episode.data = result;
		// })
	});

	function view(id: string): any {
		// console.log(id);
		goto('/view/imdb/' + id);
	}

	function upload(): any {
		const template = {
			imdbId: item.imdbResult.imdbID,
			title: item.imdbResult.Title
		};

		sessionStorage.setItem('createTemplate', JSON.stringify(template));
		goto(`/create/asset`);
	}
</script>

<div class="movies-container">
	<div class="movie-card">
		<div class="poster-container">
			<img src={item.imdbResult.Poster} alt={item.imdbResult.Title} class="movie-poster" />
			<div class="poster-placeholder"></div>
		</div>

		<div class="movie-content">
			<div class="movie-header">
				<h2 class="movie-title">{item.imdbResult.Title}</h2>
				<p class="movie-year">{item.imdbResult.Year}</p>
			</div>

			<div class="movie-details">
				<p class="movie-id">IMDb ID: {item.imdbResult.imdbID}</p>
				<p class="movie-description">Description: {item.description}</p>
			</div>

			<div class="movie-actions">
				<button onclick={() => view(item.imdbResult.imdbID)} class="view-movie-btn">View</button>
				<button onclick={() => upload()} class="view-movie-btn">Upload</button>
			</div>
		</div>
	</div>
</div>

<style>
    @keyframes cardAppear {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .movies-container {
        display: flex;
        justify-content: center;
        padding: 2rem;
    }

    .movie-card {
        width: 100%;
        max-width: 450px;
        margin: 0 auto;
        background: var(--bg-1);

        border-radius: 16px;
        border: 1px solid var(--border-color);
        box-shadow: 0 4px 12px var(--shadow-color);
        overflow: hidden;
        transition: transform 0.3s ease,
        box-shadow 0.3s ease;
        animation: cardAppear 0.6s ease both;
        position: relative;
        min-height: 500px;
    }

    .movie-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px var(--shadow-hover);
    }

    .poster-container {
        position: relative;
        height: 400px;
        background: var(--bg-2);
    }

    .movie-poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.9;
    }

    .movie-content {
        padding: 24px;
    }

    .movie-header {
        margin-bottom: 1rem;
    }

    .movie-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        color: var(--fg-1);
    }

    .movie-year {
        font-size: 1rem;
        font-weight: 400;
        margin: 0.25rem 0 0;
        color: var(--fg-2);
    }

    .movie-details {
        margin-bottom: 1.5rem;
    }

    .movie-id,
    .movie-description {
        font-size: 0.95rem;
        color: var(--text-secondary);
        margin: 0.25rem 0;
    }

    .movie-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    .view-movie-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: 1px solid var(--border-color);
        background: transparent;
        color: white;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: transform 0.2s ease,
        background 0.3s ease;
    }

    .view-movie-btn:hover {
        background: var(--accent-hover);
        transform: translateY(-1px);
    }

    @media (max-width: 768px) {
        .movie-card {
            border-radius: 12px;
            min-height: 380px;
        }

        .poster-container {
            height: 300px;
        }

        .movie-content {
            padding: 16px;
        }

        .view-movie-btn {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .movie-card {
            min-height: 360px;
        }

        .movie-title {
            font-size: 1.3rem;
        }

        .movie-year {
            font-size: 0.9rem;
        }

        .movie-id,
        .movie-description {
            font-size: 0.85rem;
        }
    }
</style>
