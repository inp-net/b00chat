<script lang="ts">
	import type { MinigameProps } from '$lib/minigames';
	import { Button } from 'azucar-ui';
    import { QuizQuestionData } from '$lib/types';
	import { CircleIcon, CrossIcon, SquareIcon, TriangleIcon } from '@lucide/svelte';

	interface ClickerProps extends MinigameProps {
		onClick: (i : number) => void;
        question?: typeof QuizQuestionData.inferIn;
        answerIndex?: number;
	}

	let { isOverlay, scores, winner, onClick, question, answerIndex }: ClickerProps = $props();

    const answerIcons = [CircleIcon, CrossIcon, TriangleIcon, SquareIcon];
    const answerColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
</script>

<h3 class="title">Quizz</h3>
{#if isOverlay}
    {#if winner}
        <p>{winner}</p>
    {:else if question}
        {#if question.img}
            <img src={question.img} alt="Question" />
        {/if}
        <p>{question.question}</p>
        {#if answerIndex}
            <Button>{question.answers[answerIndex]}</Button>
        {:else}
            {#each question.answers as answer}
                <Button>{answer}</Button>
            {/each}
        {/if}
    {/if}
{:else}
    {#if question}
        {#if answerIndex}
            <Button onclick={() => onClick(answerIndex)}>X</Button>
        {:else}
            {#each question.answers as _,i }
                <Button onclick={() => onClick(i)} icon={answerIcons[i]} />
            {/each}
        {/if}
    {/if}
{/if}

<style>
	.title {
		text-align: center;
	}
</style>
