import { Extension, mergeAttributes, Node } from '@tiptap/core';

/**
 * Tiptap Node extension for embedded items (field codes, app properties).
 * Renders as an inline, atomic (non-editable) badge within the editor.
 */
export const EmbeddedItemNode = Node.create({
  name: 'embeddedItem',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      type: { default: 'fieldCode' },
      value: { default: '' },
      label: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-embedded-type]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return false;
          return {
            type: dom.getAttribute('data-embedded-type'),
            value: dom.getAttribute('data-embedded-value'),
            label: dom.textContent,
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-embedded-type': node.attrs.type,
        'data-embedded-value': node.attrs.value,
        contenteditable: 'false',
      }),
      node.attrs.label,
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('span');
      dom.style.display = 'inline-flex';
      dom.style.alignItems = 'center';
      dom.style.verticalAlign = 'baseline';
      dom.style.userSelect = 'none';
      dom.contentEditable = 'false';

      const badge = document.createElement('span');
      badge.style.display = 'inline-flex';
      badge.style.alignItems = 'center';
      badge.style.gap = '4px';
      badge.style.padding = '0 8px';
      badge.style.height = '24px';
      badge.style.borderRadius = '16px';
      badge.style.fontSize = '0.8125rem';
      badge.style.lineHeight = '1';
      badge.style.whiteSpace = 'nowrap';
      badge.style.border = '1px solid';
      badge.style.margin = '0 2px';

      const color =
        node.attrs.type === 'fieldCode'
          ? 'var(--mui-palette-primary-main, #1976d2)'
          : 'var(--mui-palette-secondary-main, #9c27b0)';
      badge.style.borderColor = color;
      badge.style.color = color;

      const labelSpan = document.createElement('span');
      labelSpan.textContent = node.attrs.label;
      badge.appendChild(labelSpan);

      if (editor.isEditable) {
        const deleteBtn = document.createElement('span');
        deleteBtn.setAttribute('role', 'button');
        deleteBtn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.display = 'inline-flex';
        deleteBtn.style.alignItems = 'center';
        deleteBtn.style.marginLeft = '2px';
        deleteBtn.style.opacity = '0.7';
        deleteBtn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const pos = getPos();
          if (typeof pos === 'number') {
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + node.nodeSize })
              .run();
          }
        });
        badge.appendChild(deleteBtn);
      }

      dom.appendChild(badge);

      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type.name !== 'embeddedItem') return false;
          labelSpan.textContent = updatedNode.attrs.label;
          const updatedColor =
            updatedNode.attrs.type === 'fieldCode'
              ? 'var(--mui-palette-primary-main, #1976d2)'
              : 'var(--mui-palette-secondary-main, #9c27b0)';
          badge.style.borderColor = updatedColor;
          badge.style.color = updatedColor;
          return true;
        },
      };
    };
  },
});

/**
 * Extension that prevents Enter from creating new paragraphs,
 * making the editor behave like a single-line input.
 */
export const SingleLine = Extension.create({
  name: 'singleLine',

  addKeyboardShortcuts() {
    return {
      Enter: () => true,
      'Shift-Enter': () => true,
    };
  },
});
