import { Users, Messages } from '$lib/server/database';
import { broadcastMessage, sendMessage, socketSessions } from '$lib/server/socketSessions';
import type { ClientMessage, SocketMessageSchema } from '$lib/socket';
import type { Game, QuizQuestion, QuizQuestionData } from '$lib/types';
import { type Major, Majors } from '$lib/users';
import type { Socket } from '@sveltejs/kit';
import questions from '$lib/assets/questions.json';

let currentGame: typeof Game.inferIn | null = null;
const clickerState: { interval: NodeJS.Timeout | null; score: Map<Major, number> } = {
	interval: null,
	score: new Map<Major, number>([
		["sdn", 0],
		["eeea", 0],
		["mfee", 0]
	])
};

const quizState: {
	interval: NodeJS.Timeout | null;
	answering: boolean;
	question: typeof QuizQuestionData.inferIn | null;
	answersCounts: Array<Map<Major, number>>;
	score: Map<Major, number>;
} = {
	interval: null,
	answering: false,
	question: null,
	answersCounts: [],
	score: new Map<Major, number>([
		["sdn", 0],
		["eeea", 0],
		["mfee", 0]
	])
};


let questionIndex = 0;
function getNextQuizQuestion(): typeof QuizQuestion.inferIn {
    // read the file in static/assets/questions.json and parse it as JSON
    const questionsFromFile = questions;
    const question = questionsFromFile[questionIndex % questionsFromFile.length];
    questionIndex++;

	return question;
}

export const socket: Socket = {
	upgrade(event) {
		const socketId = event.request.headers.get('sec-websocket-key');

		if (!socketId) {
			return { status: 400, body: 'Bad Request' };
		}

		if (socketSessions.has(socketId)) {
			return { status: 409, body: 'WebSocket already connected' };
		}

		socketSessions.set(socketId, { userUid: event.locals.user?.uid ?? null, peer: null });
	},
	open(peer) {
		const socketId = peer.request.headers.get('sec-websocket-key');
		if (!socketId) return;

		const socketPeer = socketSessions.get(socketId);
		socketSessions.set(socketId, { userUid: socketPeer?.userUid ?? null, peer });

		const previousMessages = Messages.latest(10);
		const socketPreviousMessages: ClientMessage[] = previousMessages
			.map((msg) => ({
				id: msg.id,
				content: msg.content,
				senderName: msg.sender.name,
				senderUid: msg.sender.uid,
				senderBanned: msg.sender.banned,
				major: msg.sender.major,
				censored: msg.censored
			}))
			.reverse();

		sendMessage(peer, { type: 'message:created:batch', content: socketPreviousMessages });

		if (currentGame) {
			sendMessage(peer, { type: 'game:start', content: currentGame });
		}
	},
	close(peer) {
		const socketId = peer.request.headers.get('sec-websocket-key');
		if (!socketId || !socketSessions.has(socketId)) return;

		socketSessions.delete(socketId);
	},
	async message(peer, message) {
		const parsed = message.json() as typeof SocketMessageSchema.inferIn;
		const socketId = peer.request.headers.get('sec-websocket-key');
		if (!socketId) return;

		const socketSession = socketSessions.get(socketId ?? '');
		// If the user is not logged in or is banned, ignore their messages.
		const socketUser = Users.get(socketSession?.userUid ?? '');
		if (!socketSession || !socketUser || socketUser.banned) return;

		switch (parsed.type) {
			case 'message:create': {
				// Broadcast the message to all connected peers

				const { id, content } = Messages.insert({
					content: parsed.content.substring(0, 250),
					receivedAt: new Date(),
					sender: socketUser.uid,
					censored: false
				});

				broadcastMessage({
					type: 'message:created',
					content: {
						id,
						content: content,
						senderUid: socketUser.uid,
						senderName: socketUser.name,
						senderBanned: false,
						major: socketUser.major,
						censored: false
					}
				});
				break;
			}

			case 'game:start': {
				if (!socketUser.moderator) return;
				const game = parsed.content;
				currentGame = game;
				broadcastMessage({
					type: 'game:start',
					content: game
				});

				switch (game) {
					case 'clicker':
						if (clickerState.interval) clearInterval(clickerState.interval);
						clickerState.interval = setInterval(() => {
							broadcastMessage({
								type: 'game:clicker:score',
								content: Array.from(clickerState.score.entries())
							});
						}, 1000);
						break;
					case 'quiz':
                        quizState.score = new Map<Major, number>([
                            ["sdn", 0],
                            ["eeea", 0],
                            ["mfee", 0]
                        ]);
						// every 15 seconds send a new question to all players
						quizState.interval = setInterval(() => {
							const question = getNextQuizQuestion();
							quizState.question = question;
							quizState.answersCounts = Array(question.answers.length).fill(null).map(() => new Map<Major, number>([
								["sdn", 0],
								["eeea", 0],
								["mfee", 0]
							]));

							quizState.answering = true;
							broadcastMessage({
								type: 'game:quiz:question',
								content: quizState.question
							});
							// after 10 seconds, send the correct answer to all players
							setTimeout(() => {
								if (quizState.question) {
									quizState.answering = false;

									const correctAnswer = question.correctAnswerIndex;

									for (const major of Majors) {
										const total = quizState.answersCounts.reduce((a, b) => a + (b.get(major) ?? 0), 0);
										const current = quizState.score.get(major) ?? 0;
										const correctCount = quizState.answersCounts[correctAnswer].get(major) ?? 0;
										quizState.score.set(major, current + (total === 0 ? 0 : correctCount / total));
									}

									broadcastMessage({
										type: 'game:quiz:correct',
										content: {
											answer : question.correctAnswerIndex,
											scores: Array.from(quizState.score.entries())
										}
									});
								}
							}, 10000);
						}, 15000);

						break;
				}
				break;
			}

			case 'game:clicker:click': {
				if (!currentGame || currentGame !== 'clicker') return;
				const major = socketUser.major;
				clickerState.score.set(major, (clickerState.score.get(major) ?? 0) + 1);
				break;
			}

			case 'game:quiz:answer': {
				if (!currentGame || currentGame !== 'quiz') return;
				if (!quizState.answering) return;
				const answer = parsed.content;
				const answerCounts = quizState.answersCounts[answer];
				if (!answerCounts) return;
				answerCounts.set(socketUser.major, (answerCounts.get(socketUser.major) ?? 0) + 1);
				break;
			}

			case 'game:end': {
				const game = parsed.content;
				currentGame = null;
				if (!socketUser.moderator) return;
				broadcastMessage({
					type: 'game:end',
					content: game
				});

				switch (game) {
					case 'clicker':
						if (clickerState.interval) clearInterval(clickerState.interval);
						clickerState.interval = null;
						clickerState.score = new Map<Major, number>([
							["sdn", 0],
							["eeea", 0],
							["mfee", 0]
						]);
						break;

					case 'quiz':
						if (quizState.interval) clearInterval(quizState.interval);
						quizState.interval = null;
						quizState.answering = false;
						quizState.question = null;
						quizState.answersCounts = [];
						quizState.score = new Map<Major, number>([
							["sdn", 0],
							["eeea", 0],
							["mfee", 0]
						]);
						break;
				}
				break;
			}
		}
	}
};
