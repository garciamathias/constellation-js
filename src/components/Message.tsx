import { useEffect, useRef } from 'react';
import { useMarkdownRenderer } from '../hooks/useMarkdownRenderer';

interface MessageProps {
  content: string;
  role: 'user' | 'bot';
}

export const Message = ({ content, role }: MessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const { renderContent } = useMarkdownRenderer();

  useEffect(() => {
    const renderMessage = async () => {
      if (messageRef.current && content) {
        const renderedContent = await renderContent(content, messageRef.current);
        messageRef.current.innerHTML = renderedContent;
        if (window.MathJax) {
          window.MathJax.typesetPromise([messageRef.current]);
        }
      }
    };

    renderMessage();
  }, [content, renderContent]);

  return (
    <div className={`message ${role}`}>
      <div ref={messageRef} className="message-content" />
    </div>
  );
};