<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Button from '$lib/components/Button.svelte';
	import { LogOutIcon } from '@lucide/svelte';

	let { children } = $props();

	// TODO: replace with real auth state
	const connected = false;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="content">
	<nav>
		<h1>B00chat</h1>
		{#if connected}
			<Button href="/logout" variant="ghost" class="logout-button">
				<LogOutIcon size={24} />
			</Button>
		{:else}
			<Button href="/login" variant="default">Connexion</Button>
		{/if}
	</nav>

	{@render children()}
</div>

<style>
	@import '$lib/styles/tokens.css';
	@import '$lib/styles/base.css';

	nav {
		color: var(--color-solid-foreground);
		background: linear-gradient(
			in oklch,
			var(--color-solid-background),
			var(--color-solid-hover-background)
		);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-xs) var(--space-md);
	}

	:global(body) {
		font-family: 'Atkinson Hyperlegible', sans-serif;
		background-color: var(--color-background);
		margin: 0;
		padding: 0;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-family: 'Space Grotesk', sans-serif;
	}

	.content {
		height: 100dvh;
	}
</style>
