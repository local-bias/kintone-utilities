export type QueryBuilderMessageKey =
  | 'addCondition'
  | 'addGroup'
  | 'addValue'
  | 'builderMode'
  | 'deleteCondition'
  | 'deleteGroup'
  | 'field'
  | 'groupJoin'
  | 'groupsJoin'
  | 'inPlaceholder'
  | 'noConditions'
  | 'operator'
  | 'rawLabel'
  | 'rawMode'
  | 'switchToBuilder'
  | 'switchToRaw'
  | 'value'
  | 'parseError';

export type QueryBuilderOperatorLabel<TValue extends string = string> = {
  value: TValue;
  label: string;
};

type TranslationMap<TLocale extends string, TKey extends string> = Record<
  TLocale,
  Record<TKey, string>
>;

type LocaleResourceMap<TLocale extends string, TValue> = Record<TLocale, TValue>;

const QUERY_BUILDER_LOCALES = ['ja', 'en', 'zh', 'zh-tw', 'es', 'pt-br', 'th'] as const;

export type QueryBuilderLocale = (typeof QUERY_BUILDER_LOCALES)[number];

const QUERY_BUILDER_FALLBACK_LOCALE: QueryBuilderLocale = 'ja';

const QUERY_BUILDER_MESSAGES = {
  ja: {
    addCondition: '条件を追加',
    addGroup: '条件グループを追加',
    addValue: '追加',
    builderMode: 'フォーム',
    deleteCondition: '条件を削除',
    deleteGroup: 'グループを削除',
    field: 'フィールド',
    groupJoin: 'グループ内の結合',
    groupsJoin: 'グループ間の結合',
    inPlaceholder: '値を入力してEnterで追加',
    noConditions:
      '条件が設定されていません。条件を追加すると、対象のレコードを絞り込むことができます。',
    operator: '演算子',
    rawLabel: 'クエリ',
    rawMode: 'クエリ',
    switchToBuilder: '条件入力フォームに切り替える',
    switchToRaw: 'クエリを直接入力する',
    value: '値',
    parseError: 'クエリの解析に失敗しました。代わりにクエリを直接編集してください。',
  },
  en: {
    addCondition: 'Add condition',
    addGroup: 'Add group',
    addValue: 'Add',
    builderMode: 'Builder',
    deleteCondition: 'Delete condition',
    deleteGroup: 'Delete group',
    field: 'Field',
    groupJoin: 'Group join',
    groupsJoin: 'Groups join',
    inPlaceholder: 'Enter a value and press Enter to add',
    noConditions: 'No conditions are configured. Add one to start filtering records.',
    operator: 'Operator',
    rawLabel: 'Query',
    rawMode: 'Raw',
    switchToBuilder: 'Switch to builder mode',
    switchToRaw: 'Edit raw query',
    value: 'Value',
    parseError: 'Failed to parse query. Please edit the query directly.',
  },
  zh: {
    addCondition: '添加条件',
    addGroup: '添加条件组',
    addValue: '添加',
    builderMode: '表单',
    deleteCondition: '删除条件',
    deleteGroup: '删除组',
    field: '字段',
    groupJoin: '组内连接',
    groupsJoin: '组间连接',
    inPlaceholder: '输入值后按 Enter 添加',
    noConditions: '尚未配置条件。添加条件后即可筛选目标记录。',
    operator: '运算符',
    rawLabel: '查询',
    rawMode: '查询',
    switchToBuilder: '切换到条件表单',
    switchToRaw: '直接编辑查询',
    value: '值',
    parseError: '查询解析失败。请直接编辑查询。',
  },
  'zh-tw': {
    addCondition: '新增條件',
    addGroup: '新增條件群組',
    addValue: '新增',
    builderMode: '表單',
    deleteCondition: '刪除條件',
    deleteGroup: '刪除群組',
    field: '欄位',
    groupJoin: '群組內連接',
    groupsJoin: '群組間連接',
    inPlaceholder: '輸入值後按 Enter 新增',
    noConditions: '尚未設定條件。新增條件後即可篩選目標記錄。',
    operator: '運算子',
    rawLabel: '查詢',
    rawMode: '查詢',
    switchToBuilder: '切換到條件輸入表單',
    switchToRaw: '直接編輯查詢',
    value: '值',
    parseError: '查詢解析失敗。請直接編輯查詢。',
  },
  es: {
    addCondition: 'Agregar condición',
    addGroup: 'Agregar grupo',
    addValue: 'Agregar',
    builderMode: 'Formulario',
    deleteCondition: 'Eliminar condición',
    deleteGroup: 'Eliminar grupo',
    field: 'Campo',
    groupJoin: 'Unión dentro del grupo',
    groupsJoin: 'Unión entre grupos',
    inPlaceholder: 'Ingrese un valor y presione Enter para agregarlo',
    noConditions: 'No hay condiciones configuradas. Agregue una para empezar a filtrar registros.',
    operator: 'Operador',
    rawLabel: 'Consulta',
    rawMode: 'Texto',
    switchToBuilder: 'Cambiar al formulario de condiciones',
    switchToRaw: 'Editar consulta directamente',
    value: 'Valor',
    parseError: 'Error al analizar la consulta. Por favor, edite la consulta directamente.',
  },
  'pt-br': {
    addCondition: 'Adicionar condição',
    addGroup: 'Adicionar grupo',
    addValue: 'Adicionar',
    builderMode: 'Formulário',
    deleteCondition: 'Excluir condição',
    deleteGroup: 'Excluir grupo',
    field: 'Campo',
    groupJoin: 'Junção dentro do grupo',
    groupsJoin: 'Junção entre grupos',
    inPlaceholder: 'Digite um valor e pressione Enter para adicionar',
    noConditions:
      'Nenhuma condição foi configurada. Adicione uma para começar a filtrar registros.',
    operator: 'Operador',
    rawLabel: 'Consulta',
    rawMode: 'Texto',
    switchToBuilder: 'Alternar para o formulário de condições',
    switchToRaw: 'Editar consulta directamente',
    value: 'Valor',
    parseError: 'Falha ao analisar a consulta. Por favor, edite a consulta diretamente.',
  },
  th: {
    addCondition: 'เพิ่มเงื่อนไข',
    addGroup: 'เพิ่มกลุ่มเงื่อนไข',
    addValue: 'เพิ่ม',
    builderMode: 'ฟอร์ม',
    deleteCondition: 'ลบเงื่อนไข',
    deleteGroup: 'ลบกลุ่ม',
    field: 'ฟิลด์',
    groupJoin: 'ตัวเชื่อมภายในกลุ่ม',
    groupsJoin: 'ตัวเชื่อมระหว่างกลุ่ม',
    inPlaceholder: 'กรอกค่าแล้วกด Enter เพื่อเพิ่ม',
    noConditions: 'ยังไม่ได้ตั้งค่าเงื่อนไข เพิ่มเงื่อนไขเพื่อเริ่มกรองเรกคอร์ด',
    operator: 'ตัวดำเนินการ',
    rawLabel: 'คิวรี',
    rawMode: 'คิวรี',
    switchToBuilder: 'สลับไปยังแบบฟอร์มกำหนดเงื่อนไข',
    switchToRaw: 'แก้ไขคิวรีโดยตรง',
    value: 'ค่า',
    parseError: 'ไม่สามารถแยกวิเคราะห์คิวรีได้ กรุณาแก้ไขคิวรีโดยตรง',
  },
} satisfies TranslationMap<QueryBuilderLocale, QueryBuilderMessageKey>;

const QUERY_BUILDER_OPERATOR_LABELS = {
  ja: [
    { value: '=', label: '= (等しい)' },
    { value: '!=', label: '!= (等しくない)' },
    { value: '>', label: '> (より大きい)' },
    { value: '>=', label: '>= (以上)' },
    { value: '<', label: '< (より小さい)' },
    { value: '<=', label: '<= (以下)' },
    { value: 'in', label: 'in (いずれかに一致)' },
    { value: 'not in', label: 'not in (いずれにも不一致)' },
    { value: 'like', label: 'like (含む)' },
    { value: 'not like', label: 'not like (含まない)' },
    { value: 'is', label: 'is empty (空)' },
    { value: 'is not', label: 'is not empty (空でない)' },
  ],
  en: [
    { value: '=', label: '= (equals)' },
    { value: '!=', label: '!= (not equals)' },
    { value: '>', label: '> (greater than)' },
    { value: '>=', label: '>= (greater or equal)' },
    { value: '<', label: '< (less than)' },
    { value: '<=', label: '<= (less or equal)' },
    { value: 'in', label: 'in (any of)' },
    { value: 'not in', label: 'not in (none of)' },
    { value: 'like', label: 'like (contains)' },
    { value: 'not like', label: 'not like (not contains)' },
    { value: 'is', label: 'is empty' },
    { value: 'is not', label: 'is not empty' },
  ],
  zh: [
    { value: '=', label: '= (等于)' },
    { value: '!=', label: '!= (不等于)' },
    { value: '>', label: '> (大于)' },
    { value: '>=', label: '>= (大于等于)' },
    { value: '<', label: '< (小于)' },
    { value: '<=', label: '<= (小于等于)' },
    { value: 'in', label: 'in (匹配任一)' },
    { value: 'not in', label: 'not in (全部不匹配)' },
    { value: 'like', label: 'like (包含)' },
    { value: 'not like', label: 'not like (不包含)' },
    { value: 'is', label: 'is empty (为空)' },
    { value: 'is not', label: 'is not empty (不为空)' },
  ],
  'zh-tw': [
    { value: '=', label: '= (等於)' },
    { value: '!=', label: '!= (不等於)' },
    { value: '>', label: '> (大於)' },
    { value: '>=', label: '>= (大於等於)' },
    { value: '<', label: '< (小於)' },
    { value: '<=', label: '<= (小於等於)' },
    { value: 'in', label: 'in (符合任一)' },
    { value: 'not in', label: 'not in (全部不符合)' },
    { value: 'like', label: 'like (包含)' },
    { value: 'not like', label: 'not like (不包含)' },
    { value: 'is', label: 'is empty (為空)' },
    { value: 'is not', label: 'is not empty (不為空)' },
  ],
  es: [
    { value: '=', label: '= (igual a)' },
    { value: '!=', label: '!= (distinto de)' },
    { value: '>', label: '> (mayor que)' },
    { value: '>=', label: '>= (mayor o igual)' },
    { value: '<', label: '< (menor que)' },
    { value: '<=', label: '<= (menor o igual)' },
    { value: 'in', label: 'in (coincide con alguno)' },
    { value: 'not in', label: 'not in (no coincide con ninguno)' },
    { value: 'like', label: 'like (contiene)' },
    { value: 'not like', label: 'not like (no contiene)' },
    { value: 'is', label: 'is empty (vacío)' },
    { value: 'is not', label: 'is not empty (no vacío)' },
  ],
  'pt-br': [
    { value: '=', label: '= (igual a)' },
    { value: '!=', label: '!= (diferente de)' },
    { value: '>', label: '> (maior que)' },
    { value: '>=', label: '>= (maior ou igual)' },
    { value: '<', label: '< (menor que)' },
    { value: '<=', label: '<= (menor ou igual)' },
    { value: 'in', label: 'in (corresponde a algum)' },
    { value: 'not in', label: 'not in (não corresponde a nenhum)' },
    { value: 'like', label: 'like (contém)' },
    { value: 'not like', label: 'not like (não contém)' },
    { value: 'is', label: 'is empty (vazio)' },
    { value: 'is not', label: 'is not empty (não vazio)' },
  ],
  th: [
    { value: '=', label: '= (เท่ากับ)' },
    { value: '!=', label: '!= (ไม่เท่ากับ)' },
    { value: '>', label: '> (มากกว่า)' },
    { value: '>=', label: '>= (มากกว่าหรือเท่ากับ)' },
    { value: '<', label: '< (น้อยกว่า)' },
    { value: '<=', label: '<= (น้อยกว่าหรือเท่ากับ)' },
    { value: 'in', label: 'in (ตรงกับค่าใดค่าหนึ่ง)' },
    { value: 'not in', label: 'not in (ไม่ตรงกับทุกค่า)' },
    { value: 'like', label: 'like (มีคำนี้)' },
    { value: 'not like', label: 'not like (ไม่มีคำนี้)' },
    { value: 'is', label: 'is empty (ว่าง)' },
    { value: 'is not', label: 'is not empty (ไม่ว่าง)' },
  ],
} satisfies LocaleResourceMap<QueryBuilderLocale, QueryBuilderOperatorLabel[]>;

const QUERY_BUILDER_RAW_PLACEHOLDERS = {
  ja: '契約ステータス not in ("解約")',
  en: 'Contract_Status not in ("Cancelled")',
  zh: '合同状态 not in ("已解约")',
  'zh-tw': '合約狀態 not in ("已解約")',
  es: 'Estado_del_contrato not in ("Cancelado")',
  'pt-br': 'Status_do_contrato not in ("Cancelado")',
  th: 'สถานะสัญญา not in ("ยกเลิก")',
} satisfies LocaleResourceMap<QueryBuilderLocale, string>;

const normalizeLocale = (locale: string): string => locale.toLowerCase().replace(/_/g, '-');

const getPrimaryLocale = (locale: string): string => locale.split('-')[0];

const resolveLocale = <TLocale extends string>(
  availableLocales: readonly TLocale[],
  fallbackLocale: TLocale,
  localeCandidates: readonly (string | null | undefined)[]
): TLocale => {
  for (const candidate of localeCandidates) {
    if (!candidate) continue;

    const normalized = normalizeLocale(candidate);
    const exactMatch = availableLocales.find((locale) => locale === normalized);
    if (exactMatch) return exactMatch;

    const primaryLocale = getPrimaryLocale(normalized);
    const primaryMatch = availableLocales.find((locale) => locale === primaryLocale);
    if (primaryMatch) return primaryMatch;

    const regionalFallbackMatch = availableLocales.find(
      (locale) => getPrimaryLocale(locale) === primaryLocale
    );
    if (regionalFallbackMatch) return regionalFallbackMatch;
  }

  return fallbackLocale;
};

const createTranslator = <TLocale extends string, TKey extends string>(
  messages: TranslationMap<TLocale, TKey>,
  fallbackLocale: TLocale,
  localeCandidates: readonly (string | null | undefined)[]
) => {
  const locale = resolveLocale(
    Object.keys(messages) as TLocale[],
    fallbackLocale,
    localeCandidates
  );

  return {
    locale,
    t: (key: TKey) => messages[locale][key],
  };
};

const getLocaleResource = <TLocale extends string, TValue>(
  resources: LocaleResourceMap<TLocale, TValue>,
  locale: TLocale
): TValue => resources[locale];

export const getQueryBuilderI18n = <TValue extends string = string>(locale: string) => {
  const { locale: resolvedLocale, t } = createTranslator(
    QUERY_BUILDER_MESSAGES,
    QUERY_BUILDER_FALLBACK_LOCALE,
    [locale]
  );

  return {
    locale: resolvedLocale,
    t,
    operatorLabels: getLocaleResource(
      QUERY_BUILDER_OPERATOR_LABELS,
      resolvedLocale
    ) as QueryBuilderOperatorLabel<TValue>[],
    rawPlaceholder: getLocaleResource(QUERY_BUILDER_RAW_PLACEHOLDERS, resolvedLocale),
  };
};
