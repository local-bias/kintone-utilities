import {
  getAllApps,
  getAppId,
  getFormFields,
  getFormLayout,
  getSpace,
  getViews,
  type kintoneAPI,
  withSpaceIdFallback,
} from '@konomi-app/kintone-utilities';
import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { isDeepEqual } from 'remeda';
import invariant from 'tiny-invariant';

export const currentAppIdAtom = atom(() => {
  const app = getAppId();
  invariant(app, 'App ID not found');
  return app;
});

export const appFormFieldsAtom = atomFamily(
  (params: Parameters<typeof getFormFields>[0]) =>
    atom<Promise<kintoneAPI.FieldProperty[]>>(async () => {
      const { properties } = await getFormFields(params);
      const values = Object.values(properties);
      return values.sort((a, b) => a.label.localeCompare(b.label, 'ja'));
    }),
  (a, b) =>
    isDeepEqual(
      { ...a, preview: !!a.preview, debug: !!a.debug },
      { ...b, preview: !!b.preview, debug: !!b.debug }
    )
);

export const appFormLayoutState = atomFamily(
  (params: Parameters<typeof getFormLayout>[0]) =>
    atom<Promise<kintoneAPI.Layout>>(async () => {
      const { layout } = await getFormLayout(params);
      return layout;
    }),
  (a, b) =>
    isDeepEqual(
      { ...a, preview: !!a.preview, debug: !!a.debug },
      { ...b, preview: !!b.preview, debug: !!b.debug }
    )
);

export const appViewsAtom = atomFamily(
  (params: Parameters<typeof getViews>[0]) =>
    atom<Promise<kintoneAPI.view.Response[]>>(async () => {
      const { views } = await getViews(params);
      return Object.values(views);
    }),
  (a, b) =>
    isDeepEqual(
      { ...a, preview: !!a.preview, debug: !!a.debug },
      { ...b, preview: !!b.preview, debug: !!b.debug }
    )
);

export const allKintoneAppsAtom = atom<Promise<kintoneAPI.App[]>>(async () => {
  return getAllApps();
});

export const appWithSpaceAtom = atomFamily((appId: string) =>
  atom<Promise<(kintoneAPI.App & { space: kintoneAPI.rest.space.GetSpaceResponse | null }) | null>>(
    async (get) => {
      const apps = await get(allKintoneAppsAtom);
      const app = apps.find((a) => a.appId === appId);
      if (!app) return null;

      if (!app.spaceId) {
        return { ...app, space: null };
      }

      const space = await withSpaceIdFallback({
        spaceId: app.spaceId,
        func: getSpace,
        funcParams: { id: app.spaceId },
      });
      return { ...app, space };
    }
  )
);
