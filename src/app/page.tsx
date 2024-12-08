'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { chatgpt } from '../lib/chatgpt';
import { useMarkdownRenderer } from '@/hooks/useMarkdownRenderer';
import { MessageRenderer } from '@/components/MessageRenderer'; // Add this import

export default function Home() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const currentMessageRef = useRef('');
  const { renderContent } = useMarkdownRenderer();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const handleStreamingUpdate = async (newContent: string) => {
    currentMessageRef.current = newContent;
    const renderedContent = await renderContent(newContent, messageContainerRef.current || undefined);
    setMessages(prev => [
      ...prev.slice(0, -1),
      { role: 'assistant', content: renderedContent }
    ]);
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    currentMessageRef.current = '';

    try {
      const response = await chatgpt(input, undefined, undefined, 'gpt-4o', true);
      
      if (typeof response !== 'string') {
        setIsLoading(false);
        setIsStreaming(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        
        for await (const chunk of response) {
          await handleStreamingUpdate(currentMessageRef.current + chunk);
        }
      } else {
        const renderedContent = await renderContent(response);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: renderedContent }
        ]);
        if (window.MathJax) {
          window.MathJax.typesetPromise();
        }
      }
    } catch (error) {
      console.error('ChatGPT Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Désolé, une erreur est survenue.' 
      }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleSubmit(e);
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Implement your logout logic here
      window.location.href = '/logout';
    } catch (error) {
      alert('Erreur lors de la déconnexion');
    }
  };

  return (
    <div className="chat-container">
      <div className="profile-menu">
        <div 
          className="profile-button" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Image
            src="/default-avatar.jpeg"
            alt="Profile"
            className="profile-image"
            width={40}
            height={40}
          />
        </div>
        {showDropdown && (
          <div className="dropdown-menu">
            <button onClick={handleLogout} className="dropdown-item">
              <Image 
                src="/icons/logout-icon.png" 
                alt="Logout" 
                width={20} 
                height={20} 
                className="menu-icon" 
              />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
      
      <div className="chat-main">
        <div id="chat-box" className="chat-box" ref={messageContainerRef}>
          
          {messages.map((msg, index) => (
            <div key={index} className={`message-container ${msg.role}-container`}>
              {msg.role === 'assistant' && (
                <div className="message-logo">
                  <Image src="/logo.png" alt="Assistant" width={40} height={40} />
                </div>
              )}
              <div className={`message ${msg.role}`}>
                <MessageRenderer content={msg.content} />
              </div>
            </div>
          ))}
          
          {isLoading && !isStreaming && (
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
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message..."
              disabled={isLoading}
            />
            <div className="input-buttons">
              <button 
                onClick={handleSubmit} 
                disabled={isLoading || !input.trim()}
              >
                <Image 
                  src="/icons/send_icon.png" 
                  alt="Send" 
                  width={30} 
                  height={30} 
                />
              </button>
              <button className="attach-button">
                <Image 
                  src="/icons/attachment-icon.png" 
                  alt="Attach" 
                  width={30} 
                  height={30} 
                />
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