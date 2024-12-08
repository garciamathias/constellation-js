import { useEffect, useRef } from 'react';
import { useRenderer } from '../hooks/useRenderer';
import Image from 'next/image';

interface MessageProps {
  content: string;
  role: 'user' | 'bot';
}

export const Message = ({ content, role }: MessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const { render } = useRenderer();

  useEffect(() => {
    if (messageRef.current && content) {
      render(content, messageRef.current);
    }
  }, [content, render]);

  return (
    <div className={`message-container ${role}-container`}>
      {role === 'bot' && (
        <div className="message-logo">
          <Image src="/static/images/logo.png" alt="Logo Constellation" width={40} height={40} />
        </div>
      )}
      <div ref={messageRef} className={`message ${role}`} />
    </div>
  );
};