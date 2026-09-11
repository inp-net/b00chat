<script lang="ts">
	import { TrashIcon, ShieldBanIcon, ShieldOffIcon, UndoIcon } from '@lucide/svelte';
	import { Button } from 'azucar-ui';
	import Sender from './Sender.svelte';
	import { banUser, censorMessage, unbanUser, uncensorMessage } from '$lib/client';

	type MessageProps = {
		id: string;
		content: string;
		senderUid: string;
		senderName: string;
		senderBanned?: boolean;
		senderColor?: string;
		showControls?: boolean;
		censored?: boolean;
	};

	let { id, content, censored, showControls, ...sender }: MessageProps = $props();
</script>

<div class="message">
	{#if showControls}
		<div class="controls">
			<Button
				variant="ghost"
				icon={censored ? UndoIcon : TrashIcon}
				onclick={() => (censored ? uncensorMessage(id) : censorMessage(id))}
			/>
			<Button
				variant="ghost"
				icon={sender.senderBanned ? ShieldOffIcon : ShieldBanIcon}
				onclick={() =>
					sender.senderBanned ? unbanUser(sender.senderUid) : banUser(sender.senderUid)}
			/>
		</div>
	{/if}
	<span class:censored>
		<Sender {...sender} />
		<span class="content">{content}</span>
	</span>
</div>

<style>
	.message {
		display: flex;
		width: 100%;
		min-width: 0;
		min-height: var(--size-lg);
		flex-shrink: 0;
		align-items: center;
		gap: var(--size-sm);
	}

	.message > span {
		display: block;
		min-width: 0;
		flex: 1;
	}

	.controls {
		display: flex;
		flex-shrink: 0;
	}

	.message:hover {
		background-color: var(--color-bg-hover);
	}

	.content {
		color: var(--color-fg-high);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.censored {
		color: var(--color-fg-low);
		opacity: 0.6;
		text-decoration: line-through;
	}
</style>
