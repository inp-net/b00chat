<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type InputProps = HTMLInputAttributes;

	let { ...rest }: InputProps = $props();
</script>

<input class="chat-input" {...rest} />

<style>
	.chat-input {
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

	.chat-input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-light);
	}
</style>
