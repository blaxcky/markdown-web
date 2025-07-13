import { useState, useCallback } from 'react';
import fileSystemService from '../services/fileSystem';

export function useFileStore() {
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentContent, setCurrentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDirectory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fileSystemService.requestDirectoryAccess();
      const directoryContents = await fileSystemService.readDirectory();
      setFiles(directoryContents);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openFile = useCallback(async (fileHandle) => {
    setIsLoading(true);
    setError(null);
    try {
      const content = await fileSystemService.readFile(fileHandle);
      setCurrentFile(fileHandle);
      setCurrentContent(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFile = useCallback(async (content = currentContent) => {
    if (!currentFile) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await fileSystemService.writeFile(currentFile, content);
      setCurrentContent(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentFile, currentContent]);

  const createNewFile = useCallback(async (fileName) => {
    setIsLoading(true);
    setError(null);
    try {
      const fileHandle = await fileSystemService.createFile(
        fileSystemService.directoryHandle,
        fileName
      );
      const directoryContents = await fileSystemService.readDirectory();
      setFiles(directoryContents);
      await openFile(fileHandle);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [openFile]);

  const deleteFile = useCallback(async (fileHandle) => {
    setIsLoading(true);
    setError(null);
    try {
      await fileSystemService.deleteFile(fileHandle);
      const directoryContents = await fileSystemService.readDirectory();
      setFiles(directoryContents);
      if (currentFile === fileHandle) {
        setCurrentFile(null);
        setCurrentContent('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentFile]);

  const refreshDirectory = useCallback(async () => {
    if (!fileSystemService.hasDirectoryAccess()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const directoryContents = await fileSystemService.readDirectory();
      setFiles(directoryContents);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    files,
    currentFile,
    currentContent,
    isLoading,
    error,
    loadDirectory,
    openFile,
    saveFile,
    createNewFile,
    deleteFile,
    refreshDirectory,
    setCurrentContent,
    hasDirectoryAccess: fileSystemService.hasDirectoryAccess(),
    isSupported: fileSystemService.isSupported()
  };
}