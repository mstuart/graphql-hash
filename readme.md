<div align="center">
  <img src="docs/assets/logo.svg" alt="graphql-hash — Generate a deterministic hash of a GraphQL query for caching and persisted queries" width="720">
</div>

<p align="center"><strong>Generate a deterministic hash of a GraphQL query for caching and persisted queries</strong></p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://www.npmjs.com/package/graphql-hash"><img src="https://img.shields.io/npm/v/graphql-hash?label=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A520-339933.svg" alt="Node 20+">
</p>

---
## Install

```sh
npm install graphql-hash
```

## Usage

```js
import graphqlHash from 'graphql-hash';

graphqlHash('{ user { name } }');
//=> 'e3b0c44298fc1c14...'

// Whitespace and comments don't affect the hash
graphqlHash(`
	# Fetch user
	{
		user {
			name
		}
	}
`);
//=> 'e3b0c44298fc1c14...' (same hash)
```

## API

### graphqlHash(query, options?)

Returns a hex-encoded hash `string`.

#### query

Type: `string`

The GraphQL query string.

#### options

Type: `object`

##### algorithm

Type: `string`\
Default: `'sha256'`

The hash algorithm to use. Any algorithm supported by `node:crypto` can be used.

### normalizeQuery(query)

Returns a normalized `string` with comments stripped, whitespace collapsed, and spaces removed around structural characters.

#### query

Type: `string`

The GraphQL query string to normalize.

## Related

- [error-serialize](https://github.com/mstuart/error-serialize) - Serialize and deserialize Error objects

## License

MIT
