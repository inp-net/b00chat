<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SenderProps } from './Sender.svelte';
	import Sender from './Sender.svelte';

	type InputProps = HTMLInputAttributes & {
		sender: SenderProps;
		value?: string;
	};

	let { sender, value = $bindable(''), ...rest }: InputProps = $props();
</script>

<div class="chat-input">
	<div class="sender">
		<Sender {...sender} />
	</div>
	<input bind:value {...rest} />
</div>

<style>
	.chat-input {
		display: flex;
		gap: var(--size-md);
		align-items: center;
		width: 100%;
	}

	.sender {
		display: flex;
		gap: var(--size-xs);
	}

	input {
		background-color: var(--color-bg);
		font: inherit;
		border-radius: var(--corner-radius);
		border: none;
		padding: var(--size-xs) var(--size-md);
		border: 2px solid var(--color-border);
		color: var(--color-fg-high);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		width: 100%;
	}

	input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent);
	}
</style>
