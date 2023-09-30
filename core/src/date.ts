export const getWareki = (
  date: Date,
  option?: { era?: 'narrow' | 'short' | 'long' }
): { gengo: string; year: number } => {
  const { era = 'narrow' } = option || {};

  const formatter = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era });

  const formatted = formatter.format(date);
  const matched = formatted.match(/^(.*?)(\d+).*/);
  if (!matched) {
    throw new Error('和暦情報のコンバートに失敗しました');
  }

  const [_, gengo, year] = matched;

  return { gengo, year: Number(year) };
};
