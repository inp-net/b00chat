<script lang="ts">
	import type { Icon } from '@lucide/svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type AnchorProps = Omit<HTMLAnchorAttributes, 'href' | 'type'> & {
		href: HTMLAnchorAttributes['href'];
		type?: never;
		disabled?: HTMLButtonAttributes['disabled'];
	};

	type ButtonProps = Omit<HTMLButtonAttributes, 'type' | 'href'> & {
		type?: HTMLButtonAttributes['type'];
		href?: never;
		disabled?: HTMLButtonAttributes['disabled'];
	};

	type Props = (AnchorProps | ButtonProps) & {
		variant?: 'default' | 'outline' | 'ghost';
		ref?: HTMLElement | null;
		icon?: typeof Icon;
	};

	let {
		variant = 'default',
		type = 'button',
		disabled = false,
		href,
		children,
		ref,
		icon,
		class: className,
		...rest
	}: Props = $props();

	const iconSize = $derived(children ? '1em' : '1.25em');

	const classes = $derived(
		['btn', `btn-${variant}`, icon && 'btn-has-icon', !children && 'btn-icon-only', className]
			.filter(Boolean)
			.join(' ')
	);
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	type={href ? undefined : type}
	href={href && !disabled ? href : undefined}
	{disabled}
	aria-disabled={disabled}
	tabindex={href && disabled ? -1 : undefined}
	bind:this={ref}
	class={classes}
	{...rest}
>
	{#if icon}
		{@const Icon = icon}
		<Icon size={iconSize} class="btn-icon" aria-hidden="true" />
	{/if}

	{#if children}
		{@render children()}
	{/if}
</svelte:element>

<style>
	:root {
		--active-scale-factor: 0.98;
	}

	.btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font: inherit;
		line-height: 1.25;
		text-align: center;
		text-decoration: none;
		white-space: nowrap;
		border: none;
		border-radius: var(--corner-radius);
		cursor: pointer;
		user-select: none;
		gap: var(--gap-icon);
		padding: var(--padding-y-icon) var(--size-md);
	}

	.btn-has-icon {
		padding-left: var(--padding-x-icon);
		padding-right: var(--size-sm);
	}

	.btn-icon-only {
		padding: var(--padding-y-icon);
		aspect-ratio: 1;
		line-height: 1;
	}

	/* Default variant */
	.btn-default {
		color: var(--color-fg-solid);
		background: linear-gradient(
			in oklch to bottom,
			var(--color-bg-solid),
			var(--color-bg-solid-hover)
		);
		box-shadow: var(--shadow-surface);
	}

	.btn-default:hover:not(:disabled) {
		background: linear-gradient(
			in oklch to bottom,
			var(--color-bg-solid-hover),
			var(--color-bg-solid-hover)
		);
	}

	.btn-default:active:not(:disabled) {
		color: var(--color-fg-solid);
		background: var(--color-bg-solid-active);
		scale: var(--active-scale-factor);
	}

	.btn-default:disabled {
		--base-color: var(--color-neutral);
		color: var(--color-border-subtle);
		background: var(--color-bg);
		cursor: not-allowed;
	}

	/* Outline variant */
	.btn-outline {
		color: var(--color-fg-low);
		background-color: var(--color-bg);
		outline-color: var(--color-border);
		outline-width: var(--size-xs);
		outline-style: auto;
		box-shadow: var(--shadow-surface);
	}

	.btn-outline:hover:not(:disabled) {
		background-color: var(--color-bg-hover);
	}

	.btn-outline:active:not(:disabled) {
		color: var(--color-fg-low);
		background-color: var(--color-bg-active);
		outline-color: var(--color-border-focus);
		scale: var(--active-scale-factor);
	}

	.btn-outline:focus-visible:not(:disabled) {
		outline-color: var(--color-border-focus);
	}

	.btn-outline:disabled {
		--base-color: var(--color-neutral);
		color: var(--color-border-subtle);
		background: var(--color-bg);
		cursor: not-allowed;
	}

	/* Ghost variant */
	.btn-ghost {
		background: none;
		color: var(--color-fg-low);
		border: none;
	}

	.btn-ghost:hover:not(:disabled) {
		text-decoration: underline;
		color: var(--color-fg-high);
	}

	.btn-ghost:active:not(:disabled) {
		color: var(--color-fg-high);
		scale: var(--active-scale-factor);
	}

	.btn-ghost:disabled {
		--base-color: var(--color-neutral);
		color: var(--color-border-subtle);
		cursor: not-allowed;
	}
</style>
