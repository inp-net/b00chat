<script lang="ts">
	type MessageProps = {
		content: string;
		senderName: string;
		senderColor?: string;
	};

	const maxSenderNameLength = 25;

	let { content, senderName, senderColor }: MessageProps = $props();
</script>

<div class="message">
	<span class="sender-name" style="color: {senderColor}"
		>{senderName.slice(0, maxSenderNameLength)}</span
	>
	<div class="content">{content}</div>
</div>

<style>
	.message {
		display: flex;
		align-items: flex-start;
		margin-bottom: var(--space-md);
		gap: var(--space-sm);
	}

	.sender-name {
		font-weight: bold;
		color: var(--color-high-contrast);
	}

	.content {
		color: var(--color-high-contrast);
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>
