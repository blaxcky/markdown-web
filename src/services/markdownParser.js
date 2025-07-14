import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

class MarkdownParser {
  constructor() {
    this.setupMarked();
  }

  setupMarked() {
    // Reset to clean state
    marked.setOptions(marked.getDefaults());
    
    // Enable GitHub Flavored Markdown with task lists
    marked.use({
      pedantic: false,
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false
    });

    // Add syntax highlighting
    marked.use(markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    }));

    // Only override essential styling - let marked.js handle the parsing
    marked.use({
      renderer: {
        code(code, infostring, escaped) {
          const lang = (infostring || '').match(/\S*/)?.[0];
          const validLang = hljs.getLanguage(lang) ? lang : 'plaintext';
          const highlighted = hljs.highlight(code, { language: validLang }).value;
          return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="hljs language-${validLang}">${highlighted}</code></pre>`;
        },

        codespan(code) {
          return `<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">${code}</code>`;
        }
      }
    });
  }

  parse(markdown) {
    try {
      // Ensure we have a string
      if (typeof markdown !== 'string') {
        console.warn('Markdown parser received non-string input:', typeof markdown);
        return `<p class="text-yellow-600">Warning: Expected string, got ${typeof markdown}</p>`;
      }
      
      if (!markdown || markdown.trim() === '') {
        return '<p class="text-gray-500">No content to display</p>';
      }
      
      const html = marked.parse(markdown);
      
      // Post-process the HTML to add custom classes
      return this.addCustomClasses(html);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return `<p class="text-red-600">Error parsing markdown: ${error.message}</p>`;
    }
  }

  addCustomClasses(html) {
    // Add Tailwind classes to standard HTML elements
    return html
      .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 bg-blue-50 py-2">')
      .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-gray-200">')
      .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-gray-900 mt-6 mb-3 pb-1 border-b border-gray-200">')
      .replace(/<h3>/g, '<h3 class="text-xl font-semibold text-gray-900 mt-4 mb-2">')
      .replace(/<h4>/g, '<h4 class="text-lg font-semibold text-gray-900 mt-3 mb-2">')
      .replace(/<h5>/g, '<h5 class="text-base font-semibold text-gray-900 mt-2 mb-1">')
      .replace(/<h6>/g, '<h6 class="text-sm font-semibold text-gray-900 mt-2 mb-1">')
      .replace(/<p>/g, '<p class="mb-4 leading-relaxed text-gray-700">')
      .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-1 my-4">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-1 my-4">')
      .replace(/<li>/g, '<li class="my-1">')
      .replace(/<strong>/g, '<strong class="font-semibold text-gray-900">')
      .replace(/<em>/g, '<em class="italic text-gray-700">')
      .replace(/<a /g, '<a class="text-blue-600 hover:text-blue-800 underline" ')
      .replace(/<table>/g, '<table class="min-w-full border border-gray-200 rounded-lg my-4">')
      .replace(/<thead>/g, '<thead class="bg-gray-50">')
      .replace(/<tbody>/g, '<tbody class="bg-white">')
      .replace(/<tr>/g, '<tr class="border-b border-gray-200">')
      .replace(/<th>/g, '<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">')
      .replace(/<td>/g, '<td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">')
      // Handle task lists specifically
      .replace(/<li><input type="checkbox" disabled="?" ?> /g, '<li class="flex items-start space-x-2 my-1"><input type="checkbox" disabled class="mt-1 rounded"> <span>')
      .replace(/<li><input type="checkbox" checked="?" disabled="?" ?> /g, '<li class="flex items-start space-x-2 my-1"><input type="checkbox" checked disabled class="mt-1 rounded"> <span class="line-through text-gray-500">')
      .replace(/<\/li>/g, '</span></li>');
  }

  parseInline(markdown) {
    try {
      if (typeof markdown !== 'string') {
        return String(markdown || '');
      }
      return marked.parseInline(markdown);
    } catch (error) {
      console.error('Inline markdown parsing error:', error);
      return markdown;
    }
  }

  extractTableOfContents(markdown) {
    try {
      const tokens = marked.lexer(markdown);
      const headings = tokens.filter(token => token.type === 'heading');
      
      return headings.map(heading => ({
        level: heading.depth,
        text: heading.text,
        id: heading.text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      }));
    } catch (error) {
      console.error('Error extracting table of contents:', error);
      return [];
    }
  }
}

export default new MarkdownParser();