<script lang="ts" module>
	export type SenderProps = {
		senderName: string;
		senderColor?: string;
		senderPronouns?: string;
	};
</script>

<script lang="ts">
	const maxSenderNameLength = 25;

	let { senderName, senderColor, senderPronouns }: SenderProps = $props();
</script>

<span class="sender-name" style="color: {senderColor}">
	{senderName.slice(0, maxSenderNameLength)}
</span>
{#if senderPronouns}
	<span class="sender-pronouns"> ({senderPronouns})</span>
{/if}

<style>
	.sender-name {
		font-weight: bold;
		color: var(--color-high-contrast);
	}

	.sender-pronouns {
		color: var(--color-low-contrast);
	}
</style>
