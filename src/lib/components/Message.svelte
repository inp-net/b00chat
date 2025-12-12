<script lang="ts">
	import Sender from './Sender.svelte';

	type MessageProps = {
		content: string;
		senderName: string;
		senderColor?: string;
		senderPronouns?: string;
	};

	let { content, ...sender }: MessageProps = $props();
</script>

<div class="message">
	<Sender {...sender} />
	<span class="content">{content}</span>
</div>

<style>
	.message {
		margin-bottom: var(--space-md);
		gap: var(--space-sm);
	}

	.content {
		color: var(--color-high-contrast);
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>
