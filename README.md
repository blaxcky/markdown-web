# Local Markdown Editor

A Progressive Web App (PWA) for editing markdown files locally using the File System Access API.

## Features

- 🔒 **Local File Access**: Edit files directly from your local file system
- 📝 **Live Preview**: Real-time markdown rendering with syntax highlighting
- 🌳 **File Tree**: Navigate through your markdown files and folders
- 💾 **Auto-Save**: Save files with Ctrl+S or the save button
- 📄 **PDF Export**: Export individual files or entire directories to PDF
- 🎨 **Syntax Highlighting**: CodeMirror editor with markdown support
- 📱 **PWA Support**: Install as a desktop or mobile app
- 🚀 **No Server Required**: Everything runs in your browser

## Requirements

- Modern browser with File System Access API support (Chrome, Edge, Opera)
- Node.js 18+ (for development)

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173/markdown-web/

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. Click "Select Directory" to choose a folder containing markdown files
2. Navigate through files in the file tree on the left
3. Edit files in the CodeMirror editor
4. See live preview on the right (toggle with "Show/Hide Preview")
5. Save files with Ctrl+S or the save button
6. Export to PDF using the export buttons in the header

## Browser Support

This application requires the File System Access API, which is currently supported in:
- Chrome 86+
- Edge 86+
- Opera 72+

## Deployment

The app is automatically deployed to GitHub Pages using GitHub Actions when changes are pushed to the main branch.

## Technology Stack

- **Frontend**: React 19, Vite
- **Editor**: CodeMirror 6
- **Markdown**: Marked.js with highlight.js
- **Styling**: Tailwind CSS
- **PDF Export**: jsPDF + html2canvas
- **PWA**: Vite PWA Plugin

## File Structure

```
src/
├── components/
│   ├── Editor/         # CodeMirror editor component
│   ├── FileTree/       # File navigation component
│   ├── Layout/         # Main layout and header
│   └── Preview/        # Markdown preview component
├── services/
│   ├── fileSystem.js   # File System Access API wrapper
│   ├── markdownParser.js # Marked.js configuration
│   └── pdfExporter.js  # PDF export functionality
└── stores/
    └── fileStore.js    # State management
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.