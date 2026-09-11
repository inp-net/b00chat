<script lang="ts" module>
	export type SenderProps = {
		senderName: string;
		senderColor?: string;
	};
</script>

<script lang="ts">
	const maxSenderNameLength = 25;

	let { senderName, senderColor }: SenderProps = $props();
</script>

<span class="sender-name" style="color: {senderColor}">
	{senderName.slice(0, maxSenderNameLength)}
</span>

<style>
	.sender-name {
		font-weight: bold;
		color: var(--color-fg-high);
	}
</style>
