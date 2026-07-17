import { buildPath, sliceIntoChunks } from './common';

describe('buildPath', () => {
  test('通常スペースの場合', () => {
    expect(buildPath({ endpointName: 'record' })).toBe('/k/v1/record.json');
  });

  test('ゲストスペースを指定した場合', () => {
    expect(buildPath({ endpointName: 'record', guestSpaceId: 1 })).toBe(
      '/k/guest/1/v1/record.json'
    );
  });

  test('プレビュー環境を指定した場合', () => {
    expect(buildPath({ endpointName: 'record', preview: true })).toBe(
      '/k/v1/preview/record.json'
    );
  });

  test('ゲストスペース + プレビュー環境を指定した場合', () => {
    expect(buildPath({ endpointName: 'record', guestSpaceId: '1', preview: true })).toBe(
      '/k/guest/1/v1/preview/record.json'
    );
  });
});

describe('sliceIntoChunks', () => {
  test('指定サイズで均等に分割する', () => {
    expect(sliceIntoChunks([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test('端数がある場合、最後のチャンクは小さくなる', () => {
    expect(sliceIntoChunks([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('空配列の場合は空配列を返却する', () => {
    expect(sliceIntoChunks([], 2)).toEqual([]);
  });
});
