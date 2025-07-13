import React, { useEffect, useRef, useCallback } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap } from '@codemirror/commands';
import { basicSetup } from 'codemirror';

function Editor({ content, onChange, onSave, currentFile }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
    }
  }, [onSave]);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: content || '',
      extensions: [
        basicSetup,
        markdown(),
        keymap.of([
          ...defaultKeymap,
          {
            key: 'Ctrl-s',
            mac: 'Cmd-s',
            run: () => {
              handleSave();
              return true;
            }
          }
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChange) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px'
          },
          '.cm-content': {
            padding: '16px',
            minHeight: '100%'
          },
          '.cm-focused': {
            outline: 'none'
          },
          '.cm-editor': {
            height: '100%'
          },
          '.cm-scroller': {
            fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace'
          }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content || ''
        }
      });
      viewRef.current.dispatch(transaction);
    }
  }, [content]);

  if (!currentFile) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">✏️</span>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Ready to write</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-1">Select a file to start editing</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">or create a new one from the file tree</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Editor</h3>
        <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
          <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs">
            {navigator.platform.includes('Mac') ? '⌘S' : 'Ctrl+S'} to save
          </kbd>
          {currentFile && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
              {currentFile.name}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div ref={editorRef} className="h-full" />
      </div>
    </div>
  );
}

export default Editor;