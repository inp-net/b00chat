<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Message from '$lib/components/Message.svelte';
	import { SocketMessageSchema, type SocketMessage } from '$lib/socket';
	import { teamColor } from '$lib/teams.js';
	import { SendIcon } from '@lucide/svelte';
	import { ArkErrors } from 'arktype';
	import { onMount } from 'svelte';

	const { data } = $props();

	const isOverlay = $derived(page.url.searchParams.has('overlay'));

	type Message = {
		content: string;
		senderName: string;
		senderPronouns: string;
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
					const { content, senderName, senderPronouns, major } = message.content;
					const senderColor = teamColor({ major });
					messages.unshift({ content, senderName, senderPronouns, senderColor });
					break;
				case 'message_batch':
					console.log('Received message batch:', message.content);
					for (const { content, senderName, senderPronouns, major } of message.content) {
						const senderColor = teamColor({ major });
						messages.unshift({ content, senderName, senderPronouns, senderColor });
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

		const reducedContent = content.substring(0, 250);

		messages.unshift({
			content: reducedContent,
			senderName: data.user.name,
			senderPronouns: data.user.pronouns,
			senderColor: teamColor(data.user)
		});

		if (ws && ws.readyState === WebSocket.OPEN) {
			const message: SocketMessage = {
				type: 'message',
				content: {
					content: reducedContent,
					senderName: data.user.name,
					senderPronouns: data.user.pronouns,
					senderUid: data.user.uid,
					timestamp: Date.now(),
					major: data.user.major
				}
			};
			ws.send(JSON.stringify(message));
		}
	};

	const minigame = $state(false);

	let messagesArea: HTMLElement | undefined = $state();
	let scrollIsLocked = $state(true);
	$effect(() => {
		messages;

		if (!scrollIsLocked) return;

		messagesArea?.scrollTo({ top: messagesArea.scrollHeight });
	});
</script>

<div class="main" class:is-overlay={isOverlay}>
	{#if minigame}
		<div class="minigame">
			<div class="minigame-container"></div>
		</div>
	{/if}
	<div class="messages" class:is-overlay={isOverlay} bind:this={messagesArea}>
		{#each messages as message}
			<Message {...message} />
		{/each}
	</div>
	{#if !isOverlay}
		<div class="footer">
			<div class="chat-input-container">
				{#if data.user}
					<ChatInput
						sender={{
							senderName: data.user.name,
							senderPronouns: data.user.pronouns,
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
		margin: var(--space-xs);
		border-radius: var(--corner-radius);
		background-color: color-mix(in oklch, var(--color-solid-background), transparent 20%);
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

	.messages.is-overlay {
		max-height: 100dvh;
		overflow-y: hidden;
		height: 100%;
	}
</style>
