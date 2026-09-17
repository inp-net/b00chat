<script lang="ts">
	import type { MinigameProps } from '$lib/minigames';
	import { Button, Flex, Stack } from 'azucar-ui';
	import { QuizQuestionData } from '$lib/types';
	import { CircleIcon, DiamondIcon, SquareIcon, TriangleIcon } from '@lucide/svelte';
	import Scorebar from '$lib/components/minigames/Scorebar.svelte';

	interface ClickerProps extends MinigameProps {
		onClick: (i: number) => void;
		question?: typeof QuizQuestionData.inferIn;
		answerIndex?: number;
	}

	let { isOverlay, scores, winner, onClick, question, answerIndex }: ClickerProps = $props();

	const answerIcons = [CircleIcon, DiamondIcon, TriangleIcon, SquareIcon];
	const answerColors = ['#db9728', '#0071ca', '#e6003e', '#299024'];
	let answered = $state(false);

	$effect(() => {
		if (answerIndex !== undefined) {
			answered = false;
		}
	});
</script>

<Stack>
	<h3 class="title">Quiz</h3>
	{#if isOverlay}
		{#if winner}
			<p>{winner}</p>
		{:else if question}
			{#if question.img}
				<img src={question.img} alt="Question" />
			{/if}
			<h2 class="title">{question.question}</h2>
			{#if answerIndex !== undefined}
				<Button
					style={`width: 100%; height: 200px; font-size: 2rem; --base-color: ${answerColors[answerIndex]};`}
				>
					{question.answers[answerIndex]}
				</Button>
			{:else}
				<Flex style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;">
					{#each question.answers as answer, i (answer)}
						<Button
							style={`width: 100%; height: 100px; font-size: 2rem; --base-color: ${answerColors[i]};`}
						>
							{answer}
						</Button>
					{/each}
				</Flex>
			{/if}
		{/if}
		<Scorebar {scores} />
	{:else}
		{#if question}
			{#if answerIndex !== undefined}
				<Button
					icon={answerIcons[answerIndex]}
					style={`width: 100%; height: 200px; font-size: 2rem; --base-color: ${answerColors[answerIndex]}; pointer-events: none;`}
				/>
			{:else if !answered}
				<Flex style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;">
					{#each question.answers as _, i (i)}
						<Button
							onclick={() => {
								onClick(i);
								answered = true;
							}}
							icon={answerIcons[i]}
							style={`width: 100%; height: 100px; font-size: 2rem; --base-color: ${answerColors[i]};`}
						/>
					{/each}
				</Flex>
			{:else}
				<p>En attente de la réponse...</p>
			{/if}
		{/if}
	{/if}
</Stack>

<style>
	.title {
		text-align: center;
	}
</style>
