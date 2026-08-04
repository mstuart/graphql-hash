import {createHash} from 'node:crypto';

export function normalizeQuery(query) {
	return query
		.replaceAll(/#[^\n]*/gv, '')
		.replaceAll(/\s+/gv, ' ')
		.replaceAll(/\s?(?<char>[\(\),:=@\{\}])\s?/gv, '$<char>')
		.trim();
}

export default function graphqlHash(query, options = {}) {
	const {algorithm = 'sha256'} = options;
	const normalized = normalizeQuery(query);
	return createHash(algorithm).update(normalized).digest('hex');
}
