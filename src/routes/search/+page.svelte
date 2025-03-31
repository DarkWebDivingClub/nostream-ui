<script lang="ts">
	import {searchResult} from '@src/stores/searchResult.svelte';
	import {goto} from '$app/navigation';
	import imdbApi from '$lib/api/ImdbApi';

	// let search = 'Big Buck Bunny';
	let search = 'Sintel';
	// let search = 'Game of Thrones';
	// let search = 'House of the Dragon';

	//TODO do a refactoring and if nothing is found in the search, display this
	function onSearch(): void {
		imdbApi.searchTitle(search).then((result) => {
			// console.log(result);
			searchResult.items = [
				{id: '1', title: result.Title, description: result.Plot, assets: [], seasons: [], imdbResult: result}
			];
			goto('/select/');
		});
	}
</script>

<div class="container">
	<div class="header_search">
		<div class="header_search_image">
			<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"></svg>
		</div>

		<div class="header_search_input">
			<input
				type="search"
				bind:value={search}
				placeholder="Search..."
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						onSearch();
					}
				}}
			/>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1000px;
		margin: auto;
		padding: 100px 15px;
	}

	.header_search {
		display: flex;
		align-items: center;
		width: 100%;
		height: 60px;
		background-color: inherit;
		border: none;
		border-radius: 40px;
		box-shadow: 0px 0px 10px rgba(184, 184, 184, 0.3);
		transition: box-shadow 0.3s ease-in-out;
		position: relative;
	}

	.header_search:focus-within {
		fill: #00b7ffff;
		box-shadow: 0px 5px 10px 2px rgb(0, 183, 255, 0.2);
		transition: 0.5s;
	}

	.header_search_image {
		flex-shrink: 0;
		margin: 8px 15px 8px 20px;
	}

	.header_search_input > input {
		flex-shrink: 0;
		width: 790px;
		height: 60px;
		font-size: 22px;
		border: none;
		background-color: transparent;
		color: inherit;
		outline: none;
	}

	.header_search_input {
		flex: 1;
		position: relative;
		height: 100%;
	}

	.header_search_input input {
		width: 100%;
		height: 100%;
		font-size: 22px;
		border: none;
		background-color: transparent;
		color: inherit;
		outline: none;
		padding-right: 40px;
	}

	.header_search_input input[type='search']::-webkit-search-cancel-button {
		position: relative;
		right: 10px;
		-webkit-appearance: none;
		height: 20px;
		width: 20px;
		background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23777"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>')
			no-repeat;
		cursor: pointer;
	}

	.header_search_input input[type='search']::-moz-search-cancel-button {
		-moz-appearance: none;
		height: 20px;
		width: 20px;
		background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23777"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>')
			no-repeat;
		cursor: pointer;
	}

	@media screen and (max-width: 768px) {
		.container {
			padding: 50px 15px;
		}

		.header_search {
			height: 50px;
		}

		.header_search_image {
			margin: 8px 10px 8px 15px;
		}

		.header_search_image svg {
			width: 25px;
			height: 25px;
		}

		.header_search_input input {
			font-size: 18px;
			padding-right: 35px;
		}
	}

	@media screen and (max-width: 480px) {
		.header_search {
			height: 45px;
			border-radius: 25px;
		}

		.header_search_image {
			margin: 8px 8px 8px 12px;
		}

		.header_search_image svg {
			width: 20px;
			height: 20px;
		}

		.header_search_input input {
			font-size: 16px;
			padding-right: 30px;
		}

		.header_search_input input[type='search']::-webkit-search-cancel-button {
			height: 16px;
			width: 16px;
			right: 5px;
		}
	}
</style>
