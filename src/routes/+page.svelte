<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Message from '$lib/components/Message.svelte';
	import { SendIcon } from '@lucide/svelte';

	const connected = true;
	const messages = [
		{
			content: 'coucou',
			senderName: 'Matteo'
		},
		{
			content: "c'est le JT Reloa2d!!!",
			senderName: 'Gwenn'
		}
	];
</script>

<div class="main">
	<div class="messages">
		{#each messages as message}
			<Message content={message.content} senderName={message.senderName} />
		{/each}
	</div>
	<div class="footer">
		{#if connected}
			<div class="chat-input-container">
				<ChatInput id="chat-input" />
				<Button>
					<SendIcon />
				</Button>
			</div>
		{:else}
			<Button>Se connecter</Button>
		{/if}
	</div>
</div>

<style>
	.main {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.footer {
		position: absolute;
		width: 100%;
		bottom: 3dvh;
	}

	.chat-input-container {
		display: flex;
		justify-content: space-around;
		gap: var(--space-sm);
		margin: 0 var(--space-md);
	}

	.messages {
		width: 100%;
		margin: var(--space-md);
		display: flex;
		flex-direction: column;
	}
</style>
