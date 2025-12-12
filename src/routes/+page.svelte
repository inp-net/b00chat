<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Message from '$lib/components/Message.svelte';
	import type { SocketMessage } from '$lib/socket';
	import { SendIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const connected = true;
	const messages: {
		content: string;
		senderName: string;
		senderColor?: string;
	}[] = $state([]);

	let ws: WebSocket | null = $state(null);
	onMount(() => {
		ws = new WebSocket('/ws');

		ws.onopen = () => {
			console.log('WebSocket connected');
		};
		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data) as SocketMessage;

			switch (message.type) {
				case 'message':
					messages.unshift({
						content: message.content.content,
						senderName: message.content.senderName,
						senderColor: message.content.senderColor
					});
					break;
				case 'message_batch':
					for (const msg of message.content) {
						messages.unshift({
							content: msg.content,
							senderName: msg.senderName,
							senderColor: msg.senderColor
						});
					}
					break;
				case 'ping':
					// Handle ping if necessary
					break;
			}
		};
	});
</script>

<div class="main">
	<div class="messages">
		{#each messages as message}
			<Message
				content={message.content}
				senderName={message.senderName}
				senderColor={message.senderColor}
			/>
		{/each}
	</div>
	<div class="footer">
		{#if connected}
			<div class="chat-input-container">
				<ChatInput id="chat-input" />
				<Button
					onclick={() => {
						const input = document.getElementById('chat-input') as HTMLInputElement;
						if (input && input.value.trim() !== '') {
							messages.unshift({
								content: input.value,
								senderName: 'You',
								senderColor: '#2ECC71'
							});
							input.value = '';
						}
					}}
				>
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
		bottom: 2dvh;
	}

	.chat-input-container {
		display: flex;
		justify-content: space-around;
		gap: var(--space-sm);
		margin: 0 var(--space-md);
	}

	.messages {
		width: 100%;
		max-height: 85dvh;
		margin: var(--space-md);
		display: flex;
		flex-direction: column-reverse;
		overflow-y: scroll;
	}
</style>
