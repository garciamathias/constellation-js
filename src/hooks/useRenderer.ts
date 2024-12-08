import { useState, useCallback } from 'react';
import { RenderingService } from '../services/RenderingService';

export const useRenderer = () => {
  const [isRendering, setIsRendering] = useState(false);
  const renderer = RenderingService.getInstance();

  const render = useCallback(async (content: string, element?: HTMLElement) => {
    setIsRendering(true);
    try {
      const rendered = await renderer.render(content);
      if (element) {
        element.innerHTML = rendered;
        await renderer.typeset(element);
      }
      setIsRendering(false);
      return rendered;
    } catch (error) {
      console.error('Rendering error:', error);
      setIsRendering(false);
      return content;
    }
  }, [renderer]); // Add renderer to dependency array

  return { render, isRendering };
};