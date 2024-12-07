import { useCallback, useEffect } from 'react';
import { renderMarkdown } from '../utils/markdownUtils';
import { protectLatexFormulas, containsLatex, renderMathJax } from '../utils/mathUtils';

export const useMarkdownRenderer = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initMathJax = async () => {
        try {
          // Attendre que MathJax soit complètement chargé
          while (!window.MathJax?.startup?.promise) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          await window.MathJax.startup.promise;
          console.log('MathJax ready');
        } catch (error) {
          console.error('MathJax initialization error:', error);
        }
      };

      initMathJax();
    }
  }, []);

  const renderContent = useCallback(async (content: string, element?: HTMLElement): Promise<string> => {
    try {
      const hasLatex = containsLatex(content);
      const { text, mappings } = hasLatex ? protectLatexFormulas(content) : { text: content, mappings: [] };

      let html = await renderMarkdown(text, mappings);

      if (element && hasLatex && typeof window !== 'undefined') {
        element.innerHTML = html;
        
        // S'assurer que MathJax est chargé avant de l'utiliser
        if (window.MathJax?.typesetPromise) {
          try {
            await window.MathJax.typesetPromise([element]);
          } catch (error) {
            console.error('MathJax typesetting error:', error);
          }
        }
      }

      return html;
    } catch (error) {
      console.error('Error in renderContent:', error);
      return content;
    }
  }, []);

  return { renderContent };
};
