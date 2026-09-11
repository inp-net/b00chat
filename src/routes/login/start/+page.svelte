<script lang="ts">
	import { onMount } from 'svelte';
	import { authClient } from '$lib/client';

	onMount(async () => {
		const { error } = await authClient.signIn.social({
			provider: 'authentik',
			callbackURL: '/'
		});

		if (error) console.error('Unable to start authentication:', error);
	});
</script>

<p>Redirection vers Authentik...</p>
