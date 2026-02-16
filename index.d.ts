export type Options = {
	/**
	The hash algorithm to use.

	@default 'sha256'
	*/
	readonly algorithm?: string;
};

/**
Normalize a GraphQL query by stripping comments, collapsing whitespace, and removing space around structural characters.

@param query - The GraphQL query string.
@returns The normalized query string.

@example
```
import {normalizeQuery} from 'graphql-hash';

normalizeQuery('{ user { name } }');
//=> '{user{name}}'
```
*/
export function normalizeQuery(query: string): string;

/**
Generate a deterministic hash of a GraphQL query for caching and persisted queries.

@param query - The GraphQL query string.
@param options - Options for the hash.
@returns The hex-encoded hash string.

@example
```
import graphqlHash from 'graphql-hash';

graphqlHash('{ user { name } }');
//=> 'a1b2c3...'
```
*/
export default function graphqlHash(query: string, options?: Options): string;
