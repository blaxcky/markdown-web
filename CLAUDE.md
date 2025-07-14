# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Progressive Web App (PWA) for editing markdown files locally using the File System Access API. It's a React-based application that runs entirely in the browser without requiring a server, allowing users to edit local markdown files with live preview and PDF export capabilities.

## Development Commands

- `npm run dev` - Start development server (runs on http://localhost:5173/markdown-web/)
- `npm run build` - Build for production (outputs to `dist` directory)  
- `npm run preview` - Preview production build

No linting or test commands are configured in this project.

## Important Configuration Notes

- Project uses ES Modules (`"type": "module"` in package.json)
- All config files must use ES import/export syntax, not CommonJS require()
- Uses Tailwind CSS v3 (stable) with PostCSS and Autoprefixer

## Architecture & Key Components

### State Management
- Uses custom React hooks pattern with `useFileStore` in `src/stores/fileStore.js`
- Central file management through `FileSystemService` singleton

### Core Services
- `src/services/fileSystem.js` - Wraps File System Access API for directory/file operations
- `src/services/markdownParser.js` - Marked.js configuration with syntax highlighting
- `src/services/pdfExporter.js` - PDF export using jsPDF + html2canvas

### Component Structure
- `src/App.jsx` - Main app with browser support checks and layout orchestration
- `src/components/Layout/Layout.jsx` - Header with export controls and app layout
- `src/components/FileTree/FileTree.jsx` - Directory navigation (filters .md files only)
- `src/components/Editor/Editor.jsx` - CodeMirror 6 editor with markdown support
- `src/components/Preview/Preview.jsx` - Live markdown preview with syntax highlighting

### Key Technical Details
- Requires File System Access API (Chrome 86+, Edge 86+, Opera 72+)
- Only shows/processes `.md` files in directory tree
- Uses Vite with base path `/markdown-web/` for GitHub Pages deployment
- PWA capabilities via vite-plugin-pwa
- Tailwind CSS for styling with dark mode support

### File System Integration
- Browser compatibility check in `App.jsx` before rendering main interface
- Directory access request through `fileSystemService.requestDirectoryAccess()`
- Recursive directory reading with markdown file filtering
- Direct file system write operations (no intermediate storage)

### State Flow
1. User selects directory → `fileStore.loadDirectory()`
2. File tree populated with `.md` files → `fileStore.files`
3. File selection → `fileStore.openFile()` → loads content to editor
4. Content editing → `fileStore.setCurrentContent()` → live preview update
5. Save operations → `fileStore.saveFile()` → direct file system write