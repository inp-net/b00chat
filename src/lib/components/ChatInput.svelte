<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SenderProps } from './Sender.svelte';
	import Sender from './Sender.svelte';

	type InputProps = HTMLInputAttributes & {
		sender: SenderProps;
	};

	let { sender, ...rest }: InputProps = $props();
</script>

<div class="chat-input">
	<div class="sender">
		<Sender {...sender} />
	</div>
	<input {...rest} />
</div>

<style>
	.chat-input {
		display: flex;
		gap: var(--space-md);
		align-items: center;
		width: 100%;
	}

	.sender {
		display: flex;
		gap: var(--space-xs);
	}

	input {
		background-color: var(--color-normal);
		font: inherit;
		border-radius: var(--corner-radius);
		border: none;
		padding: var(--space-xs) var(--space-md);
		border: 2px solid var(--color-border);
		color: var(--color-high-contrast);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		width: 100%;
	}

	input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}
</style>
