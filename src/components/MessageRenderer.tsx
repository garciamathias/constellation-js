import React, { useEffect, useRef } from 'react';

interface MessageRendererProps {
  content: string;
}

export const MessageRenderer = ({ content }: MessageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // Parser personnalisé pour les formules
    const processedContent = content
      // Remplacer les formules display
      .replace(/\[([^\]]+)\]/g, '<div class="math-display">\\[$1\\]</div>')
      // Remplacer les formules inline
      .replace(/\(([^)]+)\)/g, '<span class="math-inline">\\($1\\)</span>');

    containerRef.current.innerHTML = processedContent;

    // Forcer MathJax à retraiter le contenu
    if (window.MathJax) {
      window.MathJax.typesetClear([containerRef.current]);
      window.MathJax.typesetPromise([containerRef.current]);
    }
  }, [content]);

  return <div ref={containerRef} className="message-content" />;
};