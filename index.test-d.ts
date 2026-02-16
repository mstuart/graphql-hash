import {expectType, expectError} from 'tsd';
import graphqlHash, {normalizeQuery} from './index.js';

expectType<string>(graphqlHash('{ user { name } }'));
expectType<string>(graphqlHash('{ user { name } }', {algorithm: 'md5'}));
expectType<string>(normalizeQuery('{ user { name } }'));

expectError(graphqlHash());
expectError(graphqlHash(123));
