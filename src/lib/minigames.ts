import type { Major } from './users';

export interface MinigameProps {
	scores: Record<Major, number>;
	winner: Major | null;
}
