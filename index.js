import {createHash} from 'node:crypto';

export function normalizeQuery(query) {
	return query
		.replaceAll(/#[^\n]*/g, '')
		.replaceAll(/\s+/g, ' ')
		.replaceAll(/\s*([{}(),:@=])\s*/g, '$1')
		.trim();
}

export default function graphqlHash(query, options = {}) {
	const {algorithm = 'sha256'} = options;
	const normalized = normalizeQuery(query);
	return createHash(algorithm).update(normalized).digest('hex');
}
