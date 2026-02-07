<script lang="ts">
	import { page } from '$app/state';
	import { onMount, onDestroy } from 'svelte';

	import Button from '$lib/components/Button.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Message from '$lib/components/Message.svelte';

	import { SocketMessageSchema } from '$lib/socket';
	import { teamColor } from '$lib/teams';
	import type { Major } from '$lib/users';

	import { SendIcon } from '@lucide/svelte';
	import { ArkErrors } from 'arktype';

	const { data } = $props();
	const isOverlay = $derived(page.url.searchParams.has('overlay'));

	type ChatMessage = {
		id: string;
		content: string;
		senderUid: string;
		senderName: string;
		senderColor?: string;
		senderBanned?: boolean;
		censored?: boolean;
	};

	const messages = $state<ChatMessage[]>([]);
	const minigame = $state(false);

	let ws: WebSocket | null = $state(null);
	let chatInput: string = $state('');

	/* ----------------------------- helpers ----------------------------- */

	function withColor(msg: {
		id: string;
		content: string;
		senderUid: string;
		senderName: string;
		senderBanned: boolean;
		major: Major;
		censored: boolean;
	}): ChatMessage {
		return {
			...msg,
			senderColor: teamColor({ major: msg.major })
		};
	}

	function updateMessage(id: string, updater: (msg: ChatMessage) => void) {
		const msg = messages.find((m) => m.id === id);
		if (msg) updater(msg);
	}

	function updateUserMessages(uid: string, updater: (msg: ChatMessage) => void) {
		messages.forEach((msg) => {
			if (msg.senderUid === uid) updater(msg);
		});
	}

	function sendMessage(content: string) {
		if (!data.user || !ws || ws.readyState !== WebSocket.OPEN) return;

		ws.send(
			JSON.stringify({
				type: 'message:create',
				content: {
					content,
					senderName: data.user.name,
					senderUid: data.user.uid,
					timestamp: Date.now(),
					major: data.user.major
				}
			} satisfies typeof SocketMessageSchema.inferIn)
		);
	}

	function submitInput() {
		if (!chatInput) return;

		const value = chatInput.trim();
		if (!value) return;

		sendMessage(value);
		chatInput = '';
	}

	/* --------------------------- websocket ---------------------------- */

	onMount(() => {
		ws = new WebSocket('/api/ws');

		ws.onmessage = (event) => {
			const parsed = SocketMessageSchema(JSON.parse(event.data));

			if (parsed instanceof ArkErrors) {
				console.error('Invalid WS payload:', parsed.summary);
				return;
			}

			switch (parsed.type) {
				case 'message:created':
					messages.unshift(withColor(parsed.content));
					break;

				case 'message:created:batch':
					parsed.content.map(withColor).forEach((m) => messages.unshift(m));
					break;

				case 'message:censored':
					updateMessage(parsed.content, (m) => (m.censored = true));
					break;

				case 'message:uncensored':
					updateMessage(parsed.content, (m) => (m.censored = false));
					break;

				case 'user:banned':
					updateUserMessages(parsed.content, (m) => (m.senderBanned = true));
					break;

				case 'user:unbanned':
					updateUserMessages(parsed.content, (m) => (m.senderBanned = false));
					break;
			}
		};
	});

	onDestroy(() => {
		ws?.close();
	});
</script>

<div class="main" class:is-overlay={isOverlay}>
	{#if minigame}
		<div class="minigame">
			<div class="minigame-container"></div>
		</div>
	{/if}

	<div class="messages" class:is-overlay={isOverlay}>
		{#each messages as message}
			<Message {...message} showControls={!isOverlay && data.user?.moderator} />
		{/each}
	</div>

	{#if !isOverlay}
		<div class="footer">
			<div class="chat-input-container">
				{#if data.user}
					<ChatInput
						id="chat-input"
						bind:value={chatInput}
						sender={{
							senderName: data.user.name,
							senderColor: teamColor(data.user)
						}}
						onkeypress={(e) => e.key === 'Enter' && submitInput()}
						placeholder="Taper votre message..."
						autofocus
					/>

					<Button onclick={submitInput}>
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
