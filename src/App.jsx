import React, { useState } from 'react';
import { useFileStore } from './stores/fileStore';
import FileTree from './components/FileTree/FileTree';
import Editor from './components/Editor/Editor';
import Preview from './components/Preview/Preview';
import Layout from './components/Layout/Layout';

function App() {
  const fileStore = useFileStore();
  const [showPreview, setShowPreview] = useState(true);

  if (!fileStore.isSupported) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-md mx-4 animate-fadeIn">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Browser Not Supported
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            This application requires a modern browser that supports the File System Access API.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Please use Chrome 86+, Edge 86+, or Opera 72+
          </p>
        </div>
      </div>
    );
  }

  if (!fileStore.hasDirectoryAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-lg mx-4 animate-fadeIn">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">MD</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Local Markdown Editor
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            A powerful, privacy-focused markdown editor that works entirely in your browser. 
            Your files never leave your device.
          </p>
          <button
            onClick={fileStore.loadDirectory}
            disabled={fileStore.isLoading}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {fileStore.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Loading...
              </>
            ) : (
              <>
                <span>📁</span>
                Select Directory
              </>
            )}
          </button>
          {fileStore.error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{fileStore.error}</p>
            </div>
          )}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supports Chrome, Edge, and Opera browsers
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      showPreview={showPreview}
      onTogglePreview={() => setShowPreview(!showPreview)}
      fileStore={fileStore}
    >
      <div className="flex h-full bg-white dark:bg-slate-900">
        <div className="w-64 flex-shrink-0">
          <FileTree 
            files={fileStore.files}
            currentFile={fileStore.currentFile}
            onFileSelect={fileStore.openFile}
            onFileCreate={fileStore.createNewFile}
            onFileDelete={fileStore.deleteFile}
            onRefresh={fileStore.refreshDirectory}
            isLoading={fileStore.isLoading}
          />
        </div>
        
        <div className="flex-1 flex min-w-0">
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-slate-200 dark:border-slate-700 transition-all duration-300`}>
            <Editor
              content={fileStore.currentContent}
              onChange={fileStore.setCurrentContent}
              onSave={fileStore.saveFile}
              currentFile={fileStore.currentFile}
            />
          </div>
          
          {showPreview && (
            <div className="w-1/2 transition-all duration-300">
              <Preview 
                content={fileStore.currentContent}
                currentFile={fileStore.currentFile}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default App;