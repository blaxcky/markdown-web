import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

class MarkdownParser {
  constructor() {
    this.setupMarked();
  }

  setupMarked() {
    marked.use({
      pedantic: false,
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false
    });

    marked.use(markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    }));

    marked.use({
      extensions: [
        {
          name: 'customBlock',
          level: 'block',
          start(src) { 
            return src.match(/^:::/)?.index;
          },
          tokenizer(src, tokens) {
            const match = /^:::(\w+)\n([\s\S]+?)\n:::/.exec(src);
            if (match) {
              return {
                type: 'customBlock',
                raw: match[0],
                blockType: match[1],
                content: match[2]
              };
            }
          },
          renderer(token) {
            const className = `custom-${token.blockType}`;
            const content = this.parser.parse(token.content);
            return `<div class="${className} p-4 my-4 border border-gray-200 rounded-lg bg-gray-50">${content}</div>`;
          }
        },
        {
          name: 'todo',
          level: 'inline',
          start(src) {
            return src.match(/\[ \]|\[x\]/)?.index;
          },
          tokenizer(src, tokens) {
            const match = /^(\[ \]|\[x\]) (.+)/.exec(src);
            if (match) {
              return {
                type: 'todo',
                raw: match[0],
                checked: match[1] === '[x]',
                text: match[2]
              };
            }
          },
          renderer(token) {
            const checked = token.checked ? 'checked' : '';
            const checkedClass = token.checked ? 'line-through text-gray-500' : '';
            return `<label class="flex items-center space-x-2 my-1">
              <input type="checkbox" ${checked} disabled class="rounded">
              <span class="${checkedClass}">${token.text}</span>
            </label>`;
          }
        }
      ]
    });

    const renderer = new marked.Renderer();
    
    renderer.table = function(header, body) {
      return `<div class="overflow-x-auto my-4">
        <table class="min-w-full border border-gray-200">
          <thead class="bg-gray-50">${header}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
    };

    renderer.tablerow = function(content) {
      return `<tr class="border-b border-gray-200">${content}</tr>`;
    };

    renderer.tablecell = function(content, flags) {
      const type = flags.header ? 'th' : 'td';
      const className = flags.header ? 
        'px-4 py-2 text-left font-medium text-gray-900' : 
        'px-4 py-2 text-gray-700';
      return `<${type} class="${className}">${content}</${type}>`;
    };

    renderer.blockquote = function(quote) {
      return `<blockquote class="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 bg-blue-50 py-2">${quote}</blockquote>`;
    };

    renderer.code = function(code, language) {
      const validLang = hljs.getLanguage(language) ? language : 'plaintext';
      const highlighted = hljs.highlight(code, { language: validLang }).value;
      return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="hljs language-${validLang}">${highlighted}</code></pre>`;
    };

    marked.use({ renderer });
  }

  parse(markdown) {
    try {
      return marked.parse(markdown);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return `<p class="text-red-600">Error parsing markdown: ${error.message}</p>`;
    }
  }

  parseInline(markdown) {
    try {
      return marked.parseInline(markdown);
    } catch (error) {
      console.error('Inline markdown parsing error:', error);
      return markdown;
    }
  }

  extractTableOfContents(markdown) {
    const tokens = marked.lexer(markdown);
    const headings = tokens.filter(token => token.type === 'heading');
    
    return headings.map(heading => ({
      level: heading.depth,
      text: heading.text,
      id: heading.text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    }));
  }
}

export default new MarkdownParser();