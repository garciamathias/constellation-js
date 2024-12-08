import MarkdownContent from './MarkdownContent';

interface MessageRendererProps {
  content: string;
}

export const MessageRenderer = ({ content }: MessageRendererProps) => {
  return <MarkdownContent content={content} className="message-content" />;
};
