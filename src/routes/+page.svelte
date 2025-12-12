<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Message from '$lib/components/Message.svelte';
	import { SocketMessageSchema, type SocketMessage } from '$lib/socket';
	import { teamColor } from '$lib/teams.js';
	import { SendIcon } from '@lucide/svelte';
	import { ArkErrors } from 'arktype';
	import { onMount } from 'svelte';

	const { data } = $props();

	const loggedIn = $derived(Boolean(data.user));

	type Message = {
		content: string;
		senderName: string;
		senderColor?: string;
	};

	const messages: Message[] = $state([]);

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
			const message = SocketMessageSchema(JSON.parse(event.data));

			if (message instanceof ArkErrors) {
				console.error('Invalid message received:', message.summary);
				return;
			}

			switch (message.type) {
				case 'message':
					const { content, senderName, major } = message.content;
					const senderColor = teamColor({ major });
					messages.unshift({ content, senderName, senderColor });
					break;
				case 'message_batch':
					console.log('Received message batch:', message.content);
					for (const { content, senderName, major } of message.content) {
						const senderColor = teamColor({ major });
						messages.unshift({ content, senderName, senderColor });
					}
					break;
				case 'ping':
					// Handle ping if necessary
					break;
			}
		};
	});

	const sendMessage = (content: string) => {
		if (!data.user) return;

		messages.unshift({
			content,
			senderName: data.user.name,
			senderColor: teamColor(data.user)
		});

		if (ws && ws.readyState === WebSocket.OPEN) {
			const message: SocketMessage = {
				type: 'message',
				content: {
					content,
					senderName: data.user.name,
					senderUid: data.user.uid,
					timestamp: Date.now(),
					major: data.user.major
				}
			};
			ws.send(JSON.stringify(message));
		}
	};
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
		{#if loggedIn}
			<div class="chat-input-container">
				<ChatInput
					id="chat-input"
					onkeypress={(e) => {
						if (e.key === 'Enter') {
							const input = e.target as HTMLInputElement;
							if (input.value.trim() !== '') {
								sendMessage(input.value.trim());
								input.value = '';
							}
						}
					}}
					placeholder="Taper votre message..."
				/>
				<Button
					onclick={() => {
						const input = document.getElementById('chat-input') as HTMLInputElement;
						if (input && input.value.trim() !== '') {
							sendMessage(input.value.trim());
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
