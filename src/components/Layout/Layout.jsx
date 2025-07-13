import React, { useState } from 'react';
import pdfExporter from '../../services/pdfExporter';
import { EyeIcon, EyeOffIcon, SaveIcon, RefreshIcon, DownloadIcon, MoonIcon, SunIcon } from '../Icons';

function Layout({ children, showPreview, onTogglePreview, fileStore }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
  };

  const handleExportPDF = async () => {
    if (!fileStore.currentFile || !fileStore.currentContent) return;
    
    setIsExporting(true);
    try {
      await pdfExporter.exportFile(fileStore.currentContent, fileStore.currentFile.name);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDirectoryPDF = async () => {
    if (!fileStore.files.length) return;
    
    setIsExporting(true);
    try {
      await pdfExporter.exportDirectory(fileStore.files, 'markdown-export');
    } catch (error) {
      console.error('Directory export failed:', error);
      alert('Failed to export directory PDF: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MD</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Markdown Editor
              </h1>
              {fileStore.currentFile && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {fileStore.currentFile.name}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onTogglePreview}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors duration-200"
          >
            {showPreview ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          {fileStore.currentFile && (
            <button
              onClick={() => fileStore.saveFile()}
              disabled={fileStore.isLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200 shadow-sm"
            >
              <SaveIcon className="w-4 h-4" />
              {fileStore.isLoading ? 'Saving...' : 'Save'}
            </button>
          )}
          
          <button
            onClick={fileStore.refreshDirectory}
            disabled={fileStore.isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
            title="Refresh directory"
          >
            <RefreshIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {fileStore.currentFile && (
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200 shadow-sm"
            >
              <DownloadIcon className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          )}
          
          {fileStore.files.length > 0 && (
            <button
              onClick={handleExportDirectoryPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200 shadow-sm"
            >
              <DownloadIcon className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export All'}
            </button>
          )}
          
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
          
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors duration-200"
            title="Toggle dark mode"
          >
            {isDarkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      
      {fileStore.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{fileStore.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;