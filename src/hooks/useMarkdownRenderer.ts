import { RenderingService } from '../services/RenderingService';

export const useMarkdownRenderer = () => {
  const renderingService = RenderingService.getInstance();

  const renderContent = async (content: string, element?: HTMLElement) => {
    if (!content) return '';
    
    try {
      const renderedContent = await renderingService.render(content);
      
      if (element) {
        element.innerHTML = renderedContent;
        if (window.MathJax) {
          await window.MathJax.typesetPromise([element]);
        }
        if (window.Prism) {
          window.Prism.highlightAllUnder(element);
        }
      }
      
      return renderedContent;
    } catch (error) {
      console.error('Error rendering content:', error);
      return content;
    }
  };

  return { renderContent };
};
