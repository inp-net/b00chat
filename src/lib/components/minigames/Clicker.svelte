<script lang="ts">
	import type { MinigameProps } from '$lib/minigames';
	import { Button } from 'azucar-ui';
	import { Majors } from '$lib/users';
	import { teamColor } from '$lib/teams';

	interface ClickerProps extends MinigameProps {
		onClick: () => void;
		major?: (typeof Majors)[number];
	}

	let { major, isOverlay, scores, winner, onClick }: ClickerProps = $props();
</script>

<h3 class="title">Clicker</h3>
{#if isOverlay}
	<div class="bar">
		{#each Majors as major (major)}
			<div style="flex-grow : {scores[major]}; background-color: {teamColor(major)}">
				{#if scores[major] > 0}
					<p class="score">{scores[major]}</p>
				{/if}
			</div>
		{/each}
	</div>
{:else if major}
	<Button
		onclick={onClick}
		disabled={winner != null}
		style="width: 100%; height: 100px; background-color: {teamColor(major)};"
		>CLIQUE POUR TA FILIÈRE</Button
	>
{:else}
	<p>Connectez-vous pour jouer !</p>
{/if}

<style>
	.title {
		text-align: center;
	}

	.bar {
		display: flex;
		width: 100%;
		height: 48px;
		overflow: hidden;
		background: var(--color-bg-solid);
		align-items: center;
		border-radius: var(--corner-radius-full);
		box-shadow: var(--shadow-surface);
	}

	.score {
		font-size: 40px;
		text-align: center;
		color: white;
	}
</style>
