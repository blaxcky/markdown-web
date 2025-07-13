import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FolderIcon, FolderOpenIcon, MarkdownIcon, TrashIcon, PlusIcon } from '../Icons';

function FileTreeItem({ item, currentFile, onFileSelect, onFileDelete, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isCurrentFile = currentFile && currentFile.name === item.name;
  
  const handleClick = () => {
    if (item.type === 'file') {
      onFileSelect(item.handle);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      onFileDelete(item.handle);
    }
  };

  return (
    <div className="file-tree-item group">
      <div
        className={`
          flex items-center px-3 py-2 cursor-pointer transition-all duration-200 rounded-md mx-1
          hover:bg-slate-100 dark:hover:bg-slate-700
          ${isCurrentFile ? 
            'bg-blue-50 text-blue-700 border-l-2 border-blue-500 dark:bg-blue-900/20 dark:text-blue-400' : 
            'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleClick}
      >
        {item.type === 'directory' && (
          <div className="mr-2 flex-shrink-0 text-slate-500">
            {isExpanded ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </div>
        )}
        
        <div className="mr-2 flex-shrink-0">
          {item.type === 'file' && (
            <MarkdownIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
          {item.type === 'directory' && (
            isExpanded ? 
              <FolderOpenIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" /> :
              <FolderIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
        </div>
        
        <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
        
        {item.type === 'file' && (
          <button
            onClick={handleDelete}
            className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 text-red-500 hover:text-red-700 dark:hover:bg-red-900/20"
            title="Delete file"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {item.type === 'directory' && isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeItem
              key={`${child.name}-${index}`}
              item={child}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              onFileDelete={onFileDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileTree({ 
  files, 
  currentFile, 
  onFileSelect, 
  onFileCreate, 
  onFileDelete, 
  onRefresh,
  isLoading 
}) {
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateFile = (e) => {
    e.preventDefault();
    if (newFileName.trim()) {
      const fileName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;
      onFileCreate(fileName);
      setNewFileName('');
      setShowNewFileDialog(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Explorer</h2>
          <button
            onClick={() => setShowNewFileDialog(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            title="Create new file"
          >
            <PlusIcon className="w-3 h-3" />
            New
          </button>
        </div>
        
        {showNewFileDialog && (
          <form onSubmit={handleCreateFile} className="space-y-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.md"
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewFileDialog(false);
                  setNewFileName('');
                }}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-500 text-white rounded-md hover:bg-slate-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">Loading...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="p-6 text-center">
            <MarkdownIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No markdown files found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create a new file to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file, index) => (
              <FileTreeItem
                key={`${file.name}-${index}`}
                item={file}
                currentFile={currentFile}
                onFileSelect={onFileSelect}
                onFileDelete={onFileDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileTree;