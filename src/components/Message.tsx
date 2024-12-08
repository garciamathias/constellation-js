import { memo } from 'react';
import Image from 'next/image';
import MarkdownContent from './MarkdownContent';

interface MessageProps {
  content: string;
  role: 'user' | 'bot';
  isStreaming?: boolean;
}

export const Message = memo(({ content, role, isStreaming = false }: MessageProps) => {
  const isBot = role === 'bot';
  
  return (
    <div className={`message-container ${role}-container`}>
      {isBot && (
        <div className="message-logo">
          <Image src="/static/images/logo.png" alt="Logo Constellation" width={40} height={40} />
        </div>
      )}
      <div className={`message ${role}`}>
        <MarkdownContent content={content} />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content && prevProps.role === nextProps.role;
});

Message.displayName = 'Message';