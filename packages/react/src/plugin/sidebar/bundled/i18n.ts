export const ui = {
  ja: {
    'conditionAppendButton.label': '新しい設定',
    'contextMenu.copy': 'この設定をコピー',
    'contextMenu.paste': 'コピーした設定を貼り付け',
    'contextMenu.delete': 'この設定を削除',
  },
  en: {
    'conditionAppendButton.label': 'New Condition',
    'contextMenu.copy': 'Copy this condition',
    'contextMenu.paste': 'Paste copied condition',
    'contextMenu.delete': 'Delete this condition',
  },
  es: {
    'conditionAppendButton.label': 'Nueva condición',
    'contextMenu.copy': 'Copiar esta condición',
    'contextMenu.paste': 'Pegar condición copiada',
    'contextMenu.delete': 'Eliminar esta condición',
  },
  zh: {
    'conditionAppendButton.label': '新条件',
    'contextMenu.copy': '复制此条件',
    'contextMenu.paste': '粘贴复制的条件',
    'contextMenu.delete': '删除此条件',
  },
} as const;

export type Language = keyof typeof ui;

export const defaultLang = 'ja' satisfies Language;

const isLanguage = (lang: string): lang is Language => lang in ui;

const isTranslationKey = (key: string): key is keyof (typeof ui)[Language] =>
  key in ui[defaultLang];

export function useTranslations(lang: string) {
  if (!isLanguage(lang)) {
    throw new Error(`Unsupported language: ${lang}`);
  }
  return function t(key: string): string {
    if (!isTranslationKey(key)) {
      throw new Error(`Unsupported translation key: ${key}`);
    }
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}
