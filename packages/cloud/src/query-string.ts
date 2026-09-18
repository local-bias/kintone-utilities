function normalizeQueryValue(value: unknown): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }
  if (typeof value === 'string' || typeof value === 'bigint' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

/** Node.js の querystring.stringify と同じ形式で、ブラウザでもクエリを生成します。 */
export function stringifyQuery(params: object): string {
  return Object.entries(params)
    .flatMap(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];
      return values.map(
        (item) => `${encodeURIComponent(key)}=${encodeURIComponent(normalizeQueryValue(item))}`,
      );
    })
    .join('&');
}
