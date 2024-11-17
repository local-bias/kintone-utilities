import { KintoneEventListener } from '@konomi-app/kintone-utilities';
import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

export class KintoneEventListenerReact extends KintoneEventListener {
  public customizeView(viewId: number) {
    return {
      render: (node: ReactNode, selector: string) => {
        this.add(['app.record.index.show'], (event) => {
          if (event.viewId !== viewId) {
            return event;
          }
          const rootElement = document.querySelector(selector);
          if (!rootElement) {
            throw new Error(
              `カスタマイズビューにReactコンポーネントをレンダリングすることができませんでした。対象となる要素${selector}が見つかりませんでした。`
            );
          }
          createRoot(rootElement).render(node);
          return event;
        });
      },
    };
  }
}
