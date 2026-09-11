import type { Major } from './users';

export function teamColor(major: Major): `#${string}` {
	switch (major) {
		case 'sdn':
			return '#de3839';
		case 'eeea':
			return '#ded147';
		case 'mfee':
			return '#4174f6';
	}
}
