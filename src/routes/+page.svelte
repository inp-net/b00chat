<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Message from '$lib/components/Message.svelte';
	import { SocketMessageSchema } from '$lib/socket';
	import { teamColor } from '$lib/teams.js';
	import type { Major } from '$lib/users.js';
	import { SendIcon } from '@lucide/svelte';
	import { ArkErrors } from 'arktype';
	import { onMount } from 'svelte';

	const { data } = $props();

	const isOverlay = $derived(page.url.searchParams.has('overlay'));

	type Message = {
		id: string;
		content: string;
		senderUid: string;
		senderName: string;
		senderColor?: string;
		censored?: boolean;
	};

	const messages: Message[] = $state([]);

	const addMessage = (msg: {
		id: string;
		content: string;
		senderUid: string;
		senderName: string;
		major: Major;
		censored: boolean;
	}) => {
		const senderColor = teamColor({ major: msg.major });
		messages.unshift({ ...msg, senderColor });
	};

	// Initialize WebSocket connection
	let ws: WebSocket | null = $state(null);
	onMount(() => {
		ws = new WebSocket('/api/ws');

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
				case 'message:created':
					addMessage(message.content);
					break;
				case 'message:created:batch':
					for (const msg of message.content) {
						addMessage(msg);
					}
					break;
				case 'message:censored':
					const messageId = message.content;
					const index = messages.findIndex((msg) => msg.id === messageId);
					if (index !== -1) {
						messages[index].censored = true;
					}
					break;
			}
		};
	});

	const sendMessage = (content: string) => {
		if (!data.user) return;

		if (ws && ws.readyState === WebSocket.OPEN) {
			const message: typeof SocketMessageSchema.inferIn = {
				type: 'message:create',
				content: {
					content: content,
					senderName: data.user.name,
					senderUid: data.user.uid,
					timestamp: Date.now(),
					major: data.user.major
				}
			};
			ws.send(JSON.stringify(message));
		}
	};

	const minigame = $state(false);
</script>

<div class="main" class:is-overlay={isOverlay}>
	{#if minigame}
		<div class="minigame">
			<div class="minigame-container"></div>
		</div>
	{/if}
	<div class="messages" class:is-overlay={isOverlay}>
		{#each messages as message}
			<Message {...message} showControls={!isOverlay || data.user?.moderator} />
		{/each}
	</div>
	{#if !isOverlay}
		<div class="footer">
			<div class="chat-input-container">
				{#if data.user}
					<ChatInput
						sender={{
							senderName: data.user.name,
							senderColor: teamColor(data.user)
						}}
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
				{:else}
					<Button href="/login">Se connecter</Button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.main {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.main.is-overlay {
		height: 100dvh;
	}
	.minigame {
		position: absolute;
		top: 10dvh;
		width: 100%;
	}

	.minigame-container {
		height: 40dvh;
		margin: var(--size-xs);
		border-radius: var(--corner-radius);
		background-color: color-mix(in oklch, var(--color-bg-solid), transparent 20%);
		border: 2px solid var(--color-border);
	}

	.footer {
		position: absolute;
		width: 100%;
		bottom: 2dvh;
	}

	.chat-input-container {
		display: flex;
		justify-content: space-around;
		gap: var(--size-sm);
		margin: 0 var(--size-md);
	}

	.messages {
		width: 100%;
		max-height: 85dvh;
		margin: var(--size-md);
		display: flex;
		flex-direction: column-reverse;
		overflow-y: scroll;
	}

	.messages.is-overlay {
		max-height: 100dvh;
		overflow-y: hidden;
		height: 100%;
	}
</style>
