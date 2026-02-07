<script lang="ts">
	import { TrashIcon, ShieldBanIcon, ShieldOffIcon, UndoIcon } from '@lucide/svelte';
	import Button from './Button.svelte';
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
		height: var(--size-lg);
		align-items: center;
		gap: var(--size-sm);
	}

	.message:hover {
		background-color: var(--color-bg-hover);
	}

	.content {
		color: var(--color-fg-high);
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.censored {
		color: var(--color-fg-low);
		opacity: 0.6;
		text-decoration: line-through;
	}
</style>
