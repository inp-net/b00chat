<script lang="ts">
	import { TrashIcon, ShieldBanIcon } from '@lucide/svelte';
	import Button from './Button.svelte';
	import Sender from './Sender.svelte';

	type MessageProps = {
		id: string;
		content: string;
		senderUid: string;
		senderName: string;
		senderColor?: string;
		showControls?: boolean;
		censored?: boolean;
	};

	let { id, content, censored, showControls, ...sender }: MessageProps = $props();

	const deleteMessage = async () => {
		const response = await fetch(`/api/messages/${id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			console.error('Failed to delete message');
		}
	};

	const banUser = async () => {
		const response = await fetch(`/api/users/${sender.senderUid}/ban`, {
			method: 'POST'
		});

		if (!response.ok) {
			console.error('Failed to ban user');
		}
	};
</script>

<div class="message">
	{#if showControls}
		<div class="controls">
			<Button variant="ghost" icon={TrashIcon} onclick={deleteMessage} />
			<Button variant="ghost" icon={ShieldBanIcon} onclick={banUser} />
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
