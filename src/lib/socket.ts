export type SocketMessageClient = {
	content: string;
	senderName: string;
	timestamp: number;
	major: string;
};

export type SocketMessage =
	| { type: 'ping' }
	| { type: 'message'; content: SocketMessageClient }
	| { type: 'message_batch'; content: SocketMessageClient[] };
