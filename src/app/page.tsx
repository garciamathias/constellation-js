'use client';

import { useState } from 'react';
import Image from 'next/image';
import { chatgpt } from '../lib/chatgpt';

export default function Home() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatgpt(input);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: typeof response === 'string' ? response : 'Error: Unexpected response type'
      }]);
    } catch (error) {
      console.error('ChatGPT Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Désolé, une erreur est survenue.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="profile-menu">
        <div className="profile-button">
          <Image
            src="/default-avatar.jpeg"
            alt="Profile"
            className="profile-image"
            width={40}
            height={40}
          />
        </div>
      </div>
      
      <div className="chat-main">
        <div className="chat-box">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              Démarrez une conversation en écrivant un message ci-dessous
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`message-container ${msg.role}-container`}>
              {msg.role === 'assistant' && (
                <div className="message-logo">
                  <Image src="/logo.png" alt="Assistant" width={40} height={40} />
                </div>
              )}
              <div className={`message ${msg.role}`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-container assistant-container">
              <div className="message-logo">
                <Image src="/logo.png" alt="Assistant" width={40} height={40} />
              </div>
              <div className="message assistant">
                Réflexion en cours...
              </div>
            </div>
          )}
        </div>
        
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message..."
              disabled={isLoading}
            />
            <div className="input-buttons">
              <button onClick={handleSubmit} disabled={isLoading || !input.trim()}>
                <Image src="/icons/send_icon.png" alt="Send" width={30} height={30} />
              </button>
            </div>
          </div>
          <div className="disclaimer-wrapper">
            <div className="disclaimer">
              Constellation peut faire des erreurs. Envisagez de vérifier les informations importantes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
