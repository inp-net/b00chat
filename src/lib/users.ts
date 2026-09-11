import { type } from 'arktype';

export const MajorSchema = type.enumerated('sdn', 'eeea', 'mfee');

export const UID = type('string.alphanumeric > 0');

export const ChurrosProfile = type({
	pronouns: 'string',
	uid: UID,
	pictureURL: 'string.url | ""',
	churrosNickname: 'string',
	firstName: 'string > 0',
	lastName: 'string > 0',
	major: { uid: MajorSchema }
}).pipe(({ uid, churrosNickname, major, pictureURL }) => ({
	uid,
	name: churrosNickname || uid,
	major: major.uid,
	pictureURL
}));

export type Major = typeof MajorSchema.infer;

export const Majors: Major[] = ['sdn', 'eeea', 'mfee'];
