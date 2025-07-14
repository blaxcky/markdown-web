import React, { useEffect, useRef, useState } from 'react';

function Editor({ content, onChange, onSave, currentFile }) {
  const [editorContent, setEditorContent] = useState(content || '');
  const [useCodeMirror, setUseCodeMirror] = useState(true);
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  
  // Update local state when content prop changes
  useEffect(() => {
    setEditorContent(content || '');
  }, [content]);

  // Try to initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current || !useCodeMirror || !currentFile) return;

    let view = null;
    
    const initCodeMirror = async () => {
      try {
        const { EditorView } = await import('@codemirror/view');
        const { EditorState } = await import('@codemirror/state');
        const { markdown } = await import('@codemirror/lang-markdown');
        
        // Clean up existing editor
        if (viewRef.current) {
          viewRef.current.destroy();
          viewRef.current = null;
        }

        // Import additional extensions
        const { defaultKeymap, history, historyKeymap } = await import('@codemirror/commands');
        const { keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } = await import('@codemirror/view');

        const state = EditorState.create({
          doc: content || '',
          extensions: [
            // Basic features
            lineNumbers(),
            highlightActiveLine(),
            highlightActiveLineGutter(),
            history(),
            EditorView.lineWrapping,
            
            // Language support with enhanced highlighting
            markdown(),
            
            // Key bindings
            keymap.of([
              ...defaultKeymap,
              ...historyKeymap,
              {
                key: 'Ctrl-s',
                mac: 'Cmd-s',
                run: () => {
                  if (onSave) onSave();
                  return true;
                }
              }
            ]),
            
            // Update listener
            EditorView.updateListener.of((update) => {
              if (update.docChanged && onChange) {
                const newContent = update.state.doc.toString();
                setEditorContent(newContent);
                onChange(newContent);
              }
            }),
            
            // Enhanced theme with syntax highlighting
            EditorView.theme({
              '&': { 
                height: '100%', 
                fontSize: '14px',
                fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace'
              },
              '.cm-content': { 
                padding: '16px', 
                minHeight: '100%',
                lineHeight: '1.6'
              },
              '.cm-focused': { outline: 'none' },
              '.cm-editor': { height: '100%' },
              '.cm-scroller': { 
                fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace'
              },
              
              // Markdown-specific styling
              '.cm-line': {
                paddingLeft: '4px'
              },
              
              // Headers
              '.tok-heading': {
                fontWeight: 'bold',
                color: '#1f2937'
              },
              '.tok-heading1': {
                fontSize: '1.5em',
                color: '#065f46'
              },
              '.tok-heading2': {
                fontSize: '1.3em', 
                color: '#0f766e'
              },
              '.tok-heading3': {
                fontSize: '1.1em',
                color: '#0d9488'
              },
              
              // Code blocks and inline code
              '.tok-monospace': {
                backgroundColor: '#f3f4f6',
                padding: '2px 4px',
                borderRadius: '3px',
                color: '#dc2626',
                fontFamily: 'inherit'
              },
              
              // Links
              '.tok-link': {
                color: '#2563eb',
                textDecoration: 'underline'
              },
              
              // Emphasis
              '.tok-emphasis': {
                fontStyle: 'italic',
                color: '#4b5563'
              },
              '.tok-strong': {
                fontWeight: 'bold',
                color: '#111827'
              },
              
              // Lists
              '.tok-list': {
                color: '#059669'
              },
              
              // Blockquotes
              '.tok-quote': {
                color: '#6b7280',
                fontStyle: 'italic',
                borderLeft: '3px solid #d1d5db',
                paddingLeft: '12px'
              }
            })
          ]
        });

        view = new EditorView({
          state,
          parent: editorRef.current
        });

        viewRef.current = view;
        
        // Focus after a short delay
        setTimeout(() => {
          if (viewRef.current) {
            viewRef.current.focus();
          }
        }, 100);

      } catch (error) {
        console.error('CodeMirror failed to load:', error);
        setUseCodeMirror(false);
      }
    };

    initCodeMirror();

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [currentFile, useCodeMirror]);

  // Update CodeMirror content when prop changes
  useEffect(() => {
    if (viewRef.current && content !== undefined) {
      const currentContent = viewRef.current.state.doc.toString();
      if (content !== currentContent) {
        const transaction = viewRef.current.state.update({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: content || ''
          }
        });
        viewRef.current.dispatch(transaction);
        setEditorContent(content || '');
      }
    }
  }, [content]);

  const handleTextareaChange = (e) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

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
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Editor</h3>
          <span className={`text-xs px-2 py-1 rounded ${useCodeMirror && viewRef.current ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {useCodeMirror && viewRef.current ? 'CodeMirror' : 'Simple Editor'}
          </span>
          <button 
            onClick={() => setUseCodeMirror(!useCodeMirror)}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Toggle Editor
          </button>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
          <button 
            onClick={() => onSave && onSave()}
            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50"
          >
            Save
          </button>
          {currentFile && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded text-xs font-medium">
              {currentFile.name}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {useCodeMirror ? (
          <div ref={editorRef} className="h-full w-full" />
        ) : (
          <textarea 
            value={editorContent} 
            onChange={handleTextareaChange}
            className="w-full h-full p-4 font-mono text-sm resize-none border-none outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            placeholder="Start writing your markdown here..."
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

export default Editor;