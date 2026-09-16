import { type } from 'arktype';
import { ulid } from 'ulid';

export const ID = type('string').default(() => ulid());
export const Now = type('Date').default(() => new Date());
export const Game = type.enumerated('clicker', 'quiz');
export const QuizQuestion = type({
	question: 'string',
	img: 'string?',
	answers: 'string[]',
	correctAnswerIndex: 'number'
});
