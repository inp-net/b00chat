// place files you want to import through the `$lib` alias in this folder.

import { type } from 'arktype';

const MajorSchema = type.enumerated('sdn', '3ea', 'mfee');

export const UID = type('string.alphanumeric > 0');

export const ChurrosProfile = type({
	uid: UID,
	pictureURL: 'string.url | null',
	nickname: 'string',
	firstName: 'string > 0',
	lastName: 'string > 0',
	major: {
		uid: MajorSchema
	}
}).pipe(({ uid, nickname, major, pictureURL }) => ({
	uid,
	name: nickname || uid,
	major: major.uid,
	pictureURL
}));

export type Major = typeof MajorSchema.infer;
