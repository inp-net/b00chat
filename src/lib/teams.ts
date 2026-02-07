import type { User } from './server/database';

export function teamColor(user: Pick<User, 'major'>): `#${string}` {
	switch (user.major) {
		case 'sdn':
			return '#de3839';
		case 'eeea':
			return '#ded147';
		case 'mfee':
			return '#4174f6';
	}
}
