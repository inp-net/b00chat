<script lang="ts">
	import { Button, Flex } from 'azucar-ui';
	import { onMount } from 'svelte';
	import { SocketMessageSchema } from '$lib/socket';
	import { Game } from '$lib/types';

	let ws: WebSocket | null = null;

	let { data } = $props();

	onMount(() => {
		ws = new WebSocket('/api/ws');
	});

	function startGame(game: typeof Game.inferIn) {
		if (!data.user || !ws || ws.readyState !== WebSocket.OPEN) return;

		ws?.send(
			JSON.stringify({
				type: 'game:start',
				content: game
			} satisfies typeof SocketMessageSchema.inferIn)
		);
	}

	function endGame(game: typeof Game.inferIn) {
		if (!data.user || !ws || ws.readyState !== WebSocket.OPEN) return;

		ws?.send(
			JSON.stringify({
				type: 'game:end',
				content: game
			} satisfies typeof SocketMessageSchema.inferIn)
		);
	}
</script>

<Flex direction="column" align="center" justify="center">
	<h2>Admin</h2>

	<!--TODO : Afficher jeu en cours -->

	<Flex direction="column" align="center" justify="center">
		<Button onclick={() => startGame('clicker')}>Lancer Clicker</Button>
		<Button onclick={() => startGame('quiz')}>Lancer Quiz</Button>
		<Button onclick={() => endGame('clicker')}>Arrêter Clicker</Button>
		<Button onclick={() => endGame('quiz')}>Arrêter Quiz</Button>
	</Flex>
</Flex>
