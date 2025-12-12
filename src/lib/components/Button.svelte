<script lang="ts">
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
	};

	let { variant = 'default', type, disabled, href, children, ref, ...rest }: Props = $props();
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	type={href ? undefined : type}
	href={href && !disabled ? href : undefined}
	disabled={href ? undefined : disabled}
	aria-disabled={href ? disabled : undefined}
	role={href && disabled ? 'link' : undefined}
	tabindex={href && disabled ? -1 : 0}
	bind:this={ref}
	{...rest}
	class={variant + ' button'}
>
	{@render children?.()}
</svelte:element>

<style>
	.button {
		color: var(--color-solid-foreground);
		font: inherit;
		background: linear-gradient(
			in oklch,
			var(--color-solid-background),
			var(--color-solid-hover-background)
		);
		border-radius: var(--corner-radius);
		border: none;
		padding: var(--space-xs) var(--space-md);
		cursor: pointer;
		transition: all 1s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
	}

	.default:hover {
		/* cannot use background-color because of the transition */
		background: linear-gradient(
			in oklch,
			var(--color-solid-hover-background),
			var(--color-solid-hover-background)
		);
	}

	.default:active {
		/* Slightly darker color on active */
		color: color-mix(in oklch, var(--color-solid-foreground), black 5%);
		background: linear-gradient(
			in oklch,
			color-mix(in oklch, var(--color-solid-background), black 15%),
			color-mix(in oklch, var(--color-solid-background), black 17%)
		);
	}

	.outline {
		box-sizing: border-box;
		background: none;
		color: var(--color-low-contrast);
		background-color: var(--color-normal);
		outline: 2px solid var(--color-border);
		outline-offset: -2px;
	}

	.outline:hover {
		background-color: var(--color-hover);
	}

	.outline:active {
		color: color-mix(in oklch, var(--color-low-contrast), black 5%);
		background-color: var(--color-selected);
		outline: 2px solid var(--color-focus-border);
		outline-offset: -2px;
	}

	.ghost {
		background: none;
		color: var(--color-solid-foreground);
	}
</style>
