<script lang="ts">
	import type { Major } from '$lib/users';

	type ScorebarProps = {
		scores: Map<Major, number>;
	};

	let { scores }: ScorebarProps = $props();
</script>

{#each Array.from(scores.entries()) as [major, score]}
	<div class="score-entry">
		<span class="major">{major}</span>
		<span class="score">{score}</span>
	</div>
{/each}
