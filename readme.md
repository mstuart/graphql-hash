# graphql-hash

> Generate a deterministic hash of a GraphQL query for caching and persisted queries

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
