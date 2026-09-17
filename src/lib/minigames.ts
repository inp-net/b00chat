import type { Major } from './users';

export interface MinigameProps {
	scores: Map<Major, number>;
	winner: Major | null;
	isOverlay: boolean;
}
