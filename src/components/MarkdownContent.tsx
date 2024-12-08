
'use client';

import { useEffect, useRef } from 'react';
import { RenderingService } from '../services/RenderingService';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const renderingService = RenderingService.getInstance();

  useEffect(() => {
    if (contentRef.current && content) {
      renderingService.streamContent(content, contentRef.current);
    }
  }, [content]);

  return <div ref={contentRef} className={className} />;
}