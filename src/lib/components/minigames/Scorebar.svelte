<script lang="ts">
	import type { Major } from '$lib/users';
	import { teamColor } from '$lib/teams';

	type ScorebarProps = {
		scores: Map<Major, number>;
	};

	let { scores }: ScorebarProps = $props();
	const scoreFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	});
</script>

<div class="bar">
	{#each Array.from(scores.entries()) as [major, score] (major)}
		<div style="flex-grow : {score}; background-color: {teamColor(major)}">
			{#if score > 0}
				<p class="score">{scoreFormatter.format(score)}</p>
			{/if}
		</div>
	{/each}
</div>

<style>
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
