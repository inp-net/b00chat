import { toast } from 'svelte-sonner';

export const censorMessage = async (messageId: string) => {
	const response = await fetch(`/api/messages/${messageId}/censor`, {
		method: 'POST'
	});

	if (!response.ok) {
		toast.error('Erreur lors de la censure du message');
	} else {
		toast.success('Message censuré');
	}
};

export const uncensorMessage = async (messageId: string) => {
	const response = await fetch(`/api/messages/${messageId}/uncensor`, {
		method: 'POST'
	});

	if (!response.ok) {
		toast.error('Erreur lors de la décensure du message');
	} else {
		toast.success('Message décensuré');
	}
};

export const banUser = async (userUid: string) => {
	const response = await fetch(`/api/users/${userUid}/ban`, {
		method: 'POST'
	});

	if (!response.ok) {
		toast.error("Erreur lors du bannissement de l'utilisateur");
	} else {
		toast.success(`Utilisateur ${userUid} banni`);
	}
};

export const unbanUser = async (userUid: string) => {
	const response = await fetch(`/api/users/${userUid}/unban`, {
		method: 'POST'
	});

	if (!response.ok) {
		toast.error("Erreur lors du débannissement de l'utilisateur");
	} else {
		toast.success(`Utilisateur ${userUid} débanni`);
	}
};
