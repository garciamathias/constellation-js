
import { Message } from './Message';

export const ChatMessage = ({ message }) => {
  return (
    <Message 
      content={message.content} 
      role={message.role} 
    />
  );
};