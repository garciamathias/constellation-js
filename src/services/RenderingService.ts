import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Prism from 'prismjs';

export class RenderingService {
  private static instance: RenderingService;
  
  private constructor() {
    this.configureMarked();
  }

  static getInstance(): RenderingService {
    if (!RenderingService.instance) {
      RenderingService.instance = new RenderingService();
    }
    return RenderingService.instance;
  }

  private configureMarked(): void {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false
    });
  }

  public async render(content: string): Promise<string> {
    const sanitizedContent = this.sanitizeMarkdown(content);
    const protectedContent = this.protectLatexFormulas(sanitizedContent);
    const htmlContent = marked(protectedContent);
    
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    this.addCodeWrappers(document);
    this.addTableWrappers(document);
    this.addDefaultLanguageClass(document);

    const finalContent = this.restoreLatexFormulas(document.body.innerHTML);
    
    return DOMPurify.sanitize(finalContent, {
      ADD_TAGS: ['math', 'mrow', 'mi', 'mo', 'mn'],
      ALLOW_DATA_ATTR: true
    });
  }

  private sanitizeMarkdown(content: string): string {
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  }

  private preprocessLatex(content: string): string {
    return content
      // Normaliser les délimiteurs display math
      .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$')
      // Normaliser les délimiteurs inline math
      .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')
      // Gérer les cas d'échappement
      .replace(/\\\\([()])/g, '\\$1')
      // Nettoyer les espaces superflus dans les formules
      .replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => 
        `$$${formula.trim()}$$`)
      .replace(/\$([\s\S]*?)\$/g, (_, formula) => 
        `$${formula.trim()}$`);
  }

  private async renderMarkdown(content: string): Promise<string> {
    return marked(content);
  }

  private sanitizeContent(html: string): string {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mspace', 'mtext', 'annotation'],
      ADD_ATTR: ['display', 'class', 'style', 'encoding'],
      ALLOW_DATA_ATTR: true,
      FORBID_TAGS: ['script', 'style'],
      FORBID_ATTR: ['onerror', 'onload']
    });
  }

  private enhanceDOM(html: string): string {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Enhance code blocks
    document.querySelectorAll('pre code').forEach(block => {
      if (!block.classList.length) {
        block.classList.add('language-plaintext');
      }
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      block.parentElement?.parentNode?.insertBefore(wrapper, block.parentElement);
      wrapper.appendChild(block.parentElement as Node);
    });

    // Enhance tables
    document.querySelectorAll('table').forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-container';
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    return document.body.innerHTML;
  }

  private prepareMathJax(html: string): string {
    return html
      // Wrapper pour les formules display
      .replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => 
        `<div class="math-display" data-latex="${this.escapeHtml(formula)}">${match}</div>`)
      // Wrapper pour les formules inline
      .replace(/\$([\s\S]*?)\$/g, (match, formula) => 
        `<span class="math-inline" data-latex="${this.escapeHtml(formula)}">${match}</span>`);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  public async typeset(element: HTMLElement): Promise<void> {
    if (window.MathJax) {
      try {
        // Nettoyer le cache MathJax pour l'élément
        window.MathJax.typesetClear([element]);
        // Retraiter les formules
        await window.MathJax.typesetPromise([element]);
      } catch (error) {
        console.error('MathJax typesetting error:', error);
        // Tentative de récupération en cas d'erreur
        this.handleMathJaxError(element);
      }
    }
  }

  private handleMathJaxError(element: HTMLElement): void {
    // Récupérer toutes les formules qui ont échoué
    element.querySelectorAll('[data-latex]').forEach(el => {
      const latex = el.getAttribute('data-latex');
      if (latex) {
        // Réinjecter la formule brute
        el.textContent = el.classList.contains('math-display') 
          ? `$$${latex}$$` 
          : `$${latex}$`;
      }
    });
  }
}