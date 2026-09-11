<script lang="ts">
	import 'azucar-ui/tokens.css';
	import 'azucar-ui/base.css';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import { LogOutIcon } from '@lucide/svelte';
	import { Toaster } from 'svelte-sonner';
	import { Button, Flex } from 'azucar-ui';

	let { children, data } = $props();

	const connected = $derived(Boolean(data.user));
	const isOverlay = $derived(page.url.searchParams.has('overlay'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="content">
	{#if !isOverlay}
		<nav>
			<h3>B00chat</h3>
			<Flex>
				{#if data.user?.moderator}
					<Button href="/admin" variant="ghost" style="color: var(--color-fg-solid);">Admin</Button>
				{/if}
				{#if connected}
					<Button href="/logout" variant="ghost">
						<LogOutIcon size={24} color="var(--color-fg-solid)" />
					</Button>
				{/if}
			</Flex>
		</nav>
	{/if}

	<Toaster position="top-center" />

	{@render children()}
</div>

<style>
	nav {
		color: var(--color-fg-solid);
		background: linear-gradient(in oklch, var(--color-bg-solid), var(--color-bg-solid-hover));
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--size-xs) var(--size-md);
	}

	:global(body) {
		font-family: 'Atkinson Hyperlegible', sans-serif;
		background-color: var(--color-bg-app);
		margin: 0;
		padding: 0;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-family: 'Space Grotesk', sans-serif;
	}

	.content {
		height: 100dvh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
</style>
