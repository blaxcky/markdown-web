class FileSystemService {
  constructor() {
    this.directoryHandle = null;
    this.fileHandles = new Map();
  }

  async requestDirectoryAccess() {
    try {
      if ('showDirectoryPicker' in window) {
        this.directoryHandle = await window.showDirectoryPicker({
          mode: 'readwrite'
        });
        return this.directoryHandle;
      } else {
        throw new Error('File System Access API not supported');
      }
    } catch (error) {
      console.error('Error accessing directory:', error);
      throw error;
    }
  }

  async readDirectory(dirHandle = this.directoryHandle) {
    if (!dirHandle) return [];
    
    const entries = [];
    try {
      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'file' && name.endsWith('.md')) {
          entries.push({
            name,
            type: 'file',
            handle
          });
        } else if (handle.kind === 'directory') {
          const subEntries = await this.readDirectory(handle);
          entries.push({
            name,
            type: 'directory',
            handle,
            children: subEntries
          });
        }
      }
    } catch (error) {
      console.error('Error reading directory:', error);
    }
    
    return entries.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  async readFile(fileHandle) {
    try {
      const file = await fileHandle.getFile();
      const content = await file.text();
      this.fileHandles.set(fileHandle.name, fileHandle);
      return content;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  async writeFile(fileHandle, content) {
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  }

  async createFile(dirHandle, fileName) {
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName, {
        create: true
      });
      await this.writeFile(fileHandle, '# New File\n\nStart writing...');
      return fileHandle;
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  }

  async deleteFile(fileHandle) {
    try {
      await this.directoryHandle.removeEntry(fileHandle.name);
      this.fileHandles.delete(fileHandle.name);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async createDirectory(dirHandle, dirName) {
    try {
      const newDirHandle = await dirHandle.getDirectoryHandle(dirName, {
        create: true
      });
      return newDirHandle;
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  }

  isSupported() {
    return 'showDirectoryPicker' in window;
  }

  hasDirectoryAccess() {
    return this.directoryHandle !== null;
  }
}

export default new FileSystemService();