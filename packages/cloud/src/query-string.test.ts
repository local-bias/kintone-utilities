import { stringify } from 'node:querystring';
import { describe, expect, test } from 'vitest';
import { stringifyQuery } from './query-string';

describe('stringifyQuery', () => {
  test('Node.js querystring互換の値と配列をブラウザ向けに変換する', () => {
    const params = {
      text: 'a b&c',
      number: 123,
      boolean: true,
      bigint: 1n,
      null: null,
      undefined: undefined,
      nan: Number.NaN,
      infinity: Number.POSITIVE_INFINITY,
      object: { nested: true },
      array: [1, Number.NaN, null, 'a b'],
    };

    expect(stringifyQuery(params)).toBe(stringify(params));
  });
});
