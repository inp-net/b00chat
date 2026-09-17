<script lang="ts">
	import { page } from '$app/state';
	import { onMount, onDestroy, tick } from 'svelte';
	import { Game, QuizQuestionData } from '$lib/types';

	import { Button, Frame } from 'azucar-ui';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import Message from '$lib/components/Message.svelte';
	import Clicker from '$lib/components/minigames/Clicker.svelte';

	import { SocketMessageSchema } from '$lib/socket';
	import { teamColor } from '$lib/teams';
	import type { Major } from '$lib/users';

	import { SendIcon } from '@lucide/svelte';
	import { ArkErrors } from 'arktype';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import Quiz from '$lib/components/minigames/Quiz.svelte';

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

	/*----------------------------- minigames --------------------------- */
	let minigame = $state<typeof Game.inferIn | null>(null);
	let scores = $state<Map<Major, number>>(
		new Map<Major, number>([
			['eeea', 0],
			['mfee', 0],
			['sdn', 0]
		])
	);
	let winner = $state<Major | null>(null);
	let question = $state<typeof QuizQuestionData.inferIn | undefined>(undefined);
	let answer = $state<number | undefined>(undefined);

	let ws: WebSocket | null = $state(null);
	let chatInput: string = $state('');
	let messagesContainer: HTMLDivElement;

	async function keepMessageScrollAtBottom() {
		await tick();
		if (messagesContainer) messagesContainer.scrollTop = 0;
	}

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
			senderColor: teamColor(msg.major)
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
				content
			})
		);
	}

	function sendClick() {
		if (!data.user || !ws || ws.readyState !== WebSocket.OPEN) return;

		ws.send(
			JSON.stringify({
				type: 'game:clicker:click'
			})
		);
	}

	function sendAnswer(i: number) {
		if (!data.user || !ws || ws.readyState !== WebSocket.OPEN) return;

		ws.send(
			JSON.stringify({
				type: 'game:quiz:answer',
				content: i
			})
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
					keepMessageScrollAtBottom();
					break;

				case 'message:created:batch':
					parsed.content.map(withColor).forEach((m) => messages.unshift(m));
					keepMessageScrollAtBottom();
					break;

				case 'message:censored':
					updateMessage(parsed.content, (m) => (m.censored = true));
					break;

				case 'message:uncensored':
					updateMessage(parsed.content, (m) => (m.censored = false));
					break;

				case 'user:banned':
					updateUserMessages(parsed.content, (m) => (m.senderBanned = true));
					if (data.user?.uid === parsed.content) {
						ws?.close();
						toast.error('Vous avez été banni du chat');
						// eslint-disable-next-line svelte/no-navigation-without-resolve
						goto('/logout');
					}
					break;

				case 'user:unbanned':
					updateUserMessages(parsed.content, (m) => (m.senderBanned = false));
					break;

				case 'game:start':
					minigame = parsed.content;
					winner = null;
					scores = new Map<Major, number>([
						['eeea', 0],
						['mfee', 0],
						['sdn', 0]
					]);
					break;

				case 'game:end':
					winner = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0] as Major;
					setTimeout(() => {
						minigame = null;
						winner = null;
						scores = new Map<Major, number>([
							['eeea', 0],
							['mfee', 0],
							['sdn', 0]
						]);
					}, 5000);
					break;

				case 'game:clicker:score':
					scores = new Map(parsed.content) as Map<Major, number>;
					break;
				case 'game:quiz:question':
					question = parsed.content as typeof QuizQuestionData.inferIn;
					answer = undefined;
					break;
				case 'game:quiz:correct':
					answer = parsed.content.answer as number;
					scores = new Map(parsed.content.scores) as Map<Major, number>;
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
			<div class="minigame-container">
				<Frame border shadow transparent>
					{#if minigame === 'clicker'}
						<Clicker major={data.user?.major} {scores} {winner} onClick={sendClick} {isOverlay} />
					{/if}
					{#if minigame === 'quiz'}
						<Quiz
							{question}
							answerIndex={answer}
							{scores}
							{winner}
							onClick={sendAnswer}
							{isOverlay}
						/>
					{/if}
				</Frame>
			</div>
		</div>
	{/if}

	<div bind:this={messagesContainer} class="messages" class:is-overlay={isOverlay}>
		{#each messages as message (message.id)}
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
							senderColor: teamColor(data.user.major)
						}}
						onkeypress={(e) => e.key === 'Enter' && submitInput()}
						placeholder="Taper votre message..."
						autofocus
					/>

					<Button onclick={submitInput} icon={SendIcon} />
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
		position: relative;
		flex: 1;
		min-height: 0;
		width: 100%;
		flex-direction: column;
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
		z-index: 10;
	}

	.minigame-container {
		height: 40dvh;
		margin: var(--size-xxl);
	}

	.footer {
		width: 100%;
		flex-shrink: 0;
		padding-bottom: 2dvh;
	}

	.chat-input-container {
		display: flex;
		justify-content: space-around;
		gap: var(--size-sm);
		margin: 0 var(--size-md);
	}

	.messages {
		width: 100%;
		flex: 1;
		min-width: 0;
		min-height: 0;
		margin: var(--size-md);
		display: flex;
		flex-direction: column-reverse;
		overflow-y: scroll;
	}

	.messages.is-overlay {
		overflow-y: hidden;
		height: 100%;
	}
</style>
