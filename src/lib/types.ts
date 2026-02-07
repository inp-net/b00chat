import { type } from 'arktype';
import { ulid } from 'ulid';

export const ID = type('string').default(() => ulid());
export const Now = type('Date').default(() => new Date());
