import { getFormFields, kintoneAPI } from '@konomi-app/kintone-utilities';
import { atom } from 'jotai';

export const fieldPropertiesAtom = async (
  props: Parameters<typeof getFormFields>[0] & {
    filter?: (field: kintoneAPI.FieldProperty) => boolean;
    sort?: (a: kintoneAPI.FieldProperty, b: kintoneAPI.FieldProperty) => number;
  }
) => {
  const { properties } = await getFormFields(props);

  return atom(
    Object.values(properties)
      .filter(props.filter ?? (() => true))
      .sort(props.sort)
  );
};
