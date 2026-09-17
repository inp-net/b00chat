<script lang="ts">
	import type { MinigameProps } from '$lib/minigames';
	import { Button } from 'azucar-ui';
	import { Majors } from '$lib/users';
	import { teamColor } from '$lib/teams';
	import Scorebar from '$lib/components/minigames/Scorebar.svelte';

	interface ClickerProps extends MinigameProps {
		onClick: () => void;
		major?: (typeof Majors)[number];
	}

	let { major, isOverlay, scores, winner, onClick }: ClickerProps = $props();
</script>

<h3 class="title">Clicker</h3>
{#if isOverlay}
	<Scorebar {scores} />
{:else if major}
	<Button
		onclick={onClick}
		disabled={winner != null}
		style="width: 100%; height: 100px; background-color: {teamColor(major)};"
	>
		CLIQUE POUR TA FILIÈRE
	</Button>
{:else}
	<p>Connectez-vous pour jouer !</p>
{/if}

<style>
	.title {
		text-align: center;
	}
</style>
