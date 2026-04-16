export type ModerationLog = {
	type: 'moderation';
	action: 'ban' | 'unban' | 'censor' | 'uncensor';
	actorUid: string;
	targetId: string;
};

export type AuthLog = {
	type: 'auth';
	action: 'login' | 'logout';
	uid: string;
};

export type LogEvent = ModerationLog | AuthLog;

export const Logger = {
	logEvent(event: LogEvent) {
		console.info(event.type, {
			...event,
			timestamp: Date.now()
		});
	}
};
