import { KintoneEventListener } from '@konomi-app/kintone-utilities';
import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

export class KintoneEventListenerReact extends KintoneEventListener {
  public customizeView(viewId: number) {
    return {
      render: (node: ReactNode, targetElement: HTMLElement) => {
        this.add(['app.record.index.show'], (event) => {
          if (event.viewId === viewId) {
            createRoot(targetElement).render(node);
          }
          return event;
        });
      },
    };
  }
}
