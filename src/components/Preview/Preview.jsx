import React, { useMemo } from 'react';
import markdownParser from '../../services/markdownParser';

function Preview({ content, currentFile }) {
  const htmlContent = useMemo(() => {
    if (!content) return '';
    return markdownParser.parse(content);
  }, [content]);

  const tableOfContents = useMemo(() => {
    if (!content) return [];
    return markdownParser.extractTableOfContents(content);
  }, [content]);

  if (!currentFile) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">📄</span>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Preview ready</h3>
          <p className="text-slate-500 dark:text-slate-400">Select a file to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Preview</h3>
      </div>
      
      <div className="flex-1 overflow-hidden flex">
        {tableOfContents.length > 0 && (
          <div className="w-56 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
              Table of Contents
            </h4>
            <nav className="space-y-1">
              {tableOfContents.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.id}`}
                  className={`
                    block text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 px-2 rounded transition-colors duration-150
                    ${item.level === 1 ? 'font-semibold text-slate-900 dark:text-slate-100' : ''}
                    ${item.level === 2 ? 'ml-3 font-medium' : ''}
                    ${item.level === 3 ? 'ml-6' : ''}
                    ${item.level > 3 ? 'ml-9' : ''}
                    hover:bg-slate-100 dark:hover:bg-slate-700
                  `}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          <div 
            className="markdown-preview prose prose-gray max-w-none p-6"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}

export default Preview;