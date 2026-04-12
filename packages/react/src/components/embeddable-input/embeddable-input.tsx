import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/react';
import { Box, FormControl, InputLabel } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CandidateDropdown } from './candidate-dropdown';
import { EmbeddedItemNode, SingleLine } from './embedded-node';
import {
  APP_EMBEDDABLE_PROPERTIES,
  createLabelResolver,
  parseToEditorContent,
  serializeEditorToString,
} from './parser';
import type {
  AppCandidate,
  EmbeddableCandidate,
  EmbeddableInputProps,
  EmbeddableTab,
  EmbeddedItem,
  FieldCandidate,
} from './types';

function candidateToItem(candidate: EmbeddableCandidate): EmbeddedItem {
  if (candidate.type === 'fieldCode') {
    return { type: 'fieldCode', value: candidate.code, label: candidate.label };
  }
  return { type: 'app', value: candidate.key, label: candidate.label };
}

/**
 * A text input field that allows embedding kintone field codes and app properties inline.
 *
 * Embedded items are rendered as badge-like chips within the text,
 * and serialized as `{{fieldCode:XXX}}` or `{{app:XXX}}`.
 *
 * A dropdown with search and category tabs appears when the input is focused,
 * letting users pick items to embed at the cursor position.
 *
 * Built on tiptap (ProseMirror) for robust text editing and caret management.
 */
export function EmbeddableInput({
  value,
  onChange,
  fieldProperties,
  app,
  label,
  placeholder,
  disabled = false,
  size = 'medium',
  sx,
}: EmbeddableInputProps) {
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Suppress onChange during programmatic content updates
  const suppressOnChangeRef = useRef(false);

  const resolveLabel = useMemo(
    () => createLabelResolver(fieldProperties, app),
    [fieldProperties, app]
  );

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, EmbeddedItemNode, SingleLine],
    content: parseToEditorContent(value, resolveLabel),
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      if (suppressOnChangeRef.current) return;
      const serialized = serializeEditorToString(ed);
      onChangeRef.current(serialized);
    },
  });

  // Sync editable state
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  // Sync external value changes (e.g. parent resets the value)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    // Only sync when editor is NOT focused (avoid cursor jumps during typing)
    if (editor.isFocused) return;

    const currentSerialized = serializeEditorToString(editor);
    if (currentSerialized !== value) {
      suppressOnChangeRef.current = true;
      editor.commands.setContent(parseToEditorContent(value, resolveLabel));
      suppressOnChangeRef.current = false;
    }
  }, [editor, value, resolveLabel]);

  // Build tabs
  const tabs = useMemo<EmbeddableTab[]>(() => {
    const result: EmbeddableTab[] = [];
    if (fieldProperties && fieldProperties.length > 0) {
      const candidates: FieldCandidate[] = fieldProperties.map((f) => ({
        type: 'fieldCode',
        code: f.code,
        label: f.label,
        fieldType: f.type,
      }));
      result.push({ key: 'fieldCode', label: 'フィールド', candidates });
    }
    if (app) {
      const candidates: AppCandidate[] = APP_EMBEDDABLE_PROPERTIES.map((p) => ({
        type: 'app',
        key: p.key,
        label: p.label,
      }));
      result.push({ key: 'app', label: 'アプリ', candidates });
    }
    return result;
  }, [fieldProperties, app]);

  // Insert embedded item at current cursor position
  const handleSelect = useCallback(
    (candidate: EmbeddableCandidate) => {
      if (!editor || editor.isDestroyed) return;
      const item = candidateToItem(candidate);

      // focus() restores the last cursor position even if the editor was blurred
      editor
        .chain()
        .focus()
        .insertContent({ type: 'embeddedItem', attrs: item })
        .run();
    },
    [editor]
  );

  // Focus/blur handling at container level (FormControl)
  const handleContainerFocus = useCallback(() => {
    if (!disabled) setFocused(true);
  }, [disabled]);

  const handleContainerBlur = useCallback((e: React.FocusEvent) => {
    // Don't close dropdown if focus moves to another element inside the container
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    setFocused(false);
  }, []);

  return (
    <FormControl
      ref={containerRef}
      variant='outlined'
      focused={focused}
      disabled={disabled}
      sx={{ position: 'relative', width: 400, ...sx }}
      onFocus={handleContainerFocus}
      onBlur={handleContainerBlur}
    >
      {label && (
        <InputLabel
          shrink
          focused={focused}
          sx={{
            bgcolor: 'background.paper',
            px: 0.5,
            transform: 'translate(14px, -9px) scale(0.75)',
            pointerEvents: 'none',
          }}
        >
          {label}
        </InputLabel>
      )}

      {/* Tiptap editor area */}
      <Box
        sx={{
          '& .tiptap': {
            minHeight: size === 'small' ? 40 : 56,
            py: size === 'small' ? '8.5px' : '16.5px',
            px: '14px',
            border: focused ? 2 : 1,
            borderStyle: 'solid',
            borderColor: focused ? 'primary.main' : 'divider',
            borderRadius: 1,
            outline: 'none',
            cursor: disabled ? 'default' : 'text',
            bgcolor: disabled ? 'action.disabledBackground' : 'transparent',
            fontSize: '1rem',
            lineHeight: 1.5,
            fontFamily: 'inherit',
            wordBreak: 'break-all',
            transition: (theme) =>
              theme.transitions.create(['border-color'], {
                duration: theme.transitions.duration.shorter,
              }),
          },
          '& .tiptap p': {
            m: 0,
          },
          '& .tiptap p.is-editor-empty:first-of-type::before': {
            content: placeholder ? `"${placeholder}"` : undefined,
            color: 'text.disabled',
            pointerEvents: 'none',
            float: 'left',
            height: 0,
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Dropdown */}
      {focused && tabs.length > 0 && <CandidateDropdown tabs={tabs} onSelect={handleSelect} />}
    </FormControl>
  );
}
