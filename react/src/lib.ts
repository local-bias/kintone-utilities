import { type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

export const embed = (component: ReactNode, params: { elementId: string; target: HTMLElement }) => {
  const { elementId, target } = params;
  if (document.getElementById(elementId)) {
    return;
  }

  const rootElement = document.createElement('div');
  rootElement.id = elementId;
  rootElement.style.display = 'inline-flex';
  target.append(rootElement);

  const root = createRoot(rootElement);

  root.render(component);
};
