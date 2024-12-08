import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';
import { LatexMapping, restoreLatexFormulas } from './mathUtils';

interface RenderOptions {
  sanitize?: boolean;
  highlight?: boolean;
}

export const configureMarked = (): void => {
  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: false,
    mangle: false,
    highlight: (code: string, lang: string) => {
      if (Prism.languages[lang]) {
        return Prism.highlight(code, Prism.languages[lang], lang);
      }
      return code;
    }
  });
};

export const renderMarkdown = async (
  content: string,
  latexMappings: LatexMapping[] = []
): Promise<string> => {
  try {
    // Convertir les formules entre crochets en notation $$
    content = content.replace(/\[(.*?)\]/g, '\\[$1\\]');
    
    // Protéger les formules inline
    content = content.replace(/\((.*?)\)/g, '\\($1\\)');

    let html = marked(content);
    
    if (latexMappings.length > 0) {
      html = restoreLatexFormulas(html, latexMappings);
    }

    html = DOMPurify.sanitize(html, {
      ADD_TAGS: ['math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mspace'],
      ADD_ATTR: ['display', 'class'],
      ALLOW_DATA_ATTR: true
    });
    
    return enhanceHTML(html);
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return content;
  }
};

export const enhanceHTML = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Wrapper pour les tableaux
  tempDiv.querySelectorAll('table').forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-container';
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  // Ajouter la classe par défaut aux blocs de code
  tempDiv.querySelectorAll('pre code:not([class*="language-"])').forEach(block => {
    block.className = 'language-plaintext';
  });

  // Wrapper pour les blocs de code
  tempDiv.querySelectorAll('pre').forEach(pre => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
  });

  return tempDiv.innerHTML;
};