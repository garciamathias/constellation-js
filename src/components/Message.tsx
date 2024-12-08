import { memo } from 'react';
import Image from 'next/image';
import MarkdownContent from './MarkdownContent';

interface MessageProps {
  content: string;
  role: 'user' | 'bot';
  isStreaming?: boolean;
}

export const Message = memo(({ content, role, isStreaming = false }: MessageProps) => {
  return (
    <div className={`message-container ${role}-container`}>
      {role === 'bot' && (
        <div className="message-logo">
          <Image src="/static/images/logo.png" alt="Logo Constellation" width={40} height={40} />
        </div>
      )}
      <MarkdownContent content={content} className={`message ${role}`} />
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content && prevProps.role === nextProps.role;
});

Message.displayName = 'Message';