'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Changed from next/router
import { collection, addDoc, query, orderBy, getDocs, doc, updateDoc } from '@firebase/firestore';
import { db, generateChatTitle, updateChatTitle } from '@/lib/firebase'; // Add these imports
import { useAuth } from '@/hooks/useAuth';
import { AuthNav } from '@/components/AuthNav';
import { ChatList } from '@/components/ChatList'; // Add this import
import Image from 'next/image';
import { chatgpt } from '../lib/chatgpt';
import { useMarkdownRenderer } from '@/hooks/useMarkdownRenderer';
import { MessageRenderer } from '@/components/MessageRenderer';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { incrementUserMessageCount, incrementUserChatCount } from '@/lib/firebase';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const currentMessageRef = useRef('');
  const { renderContent } = useMarkdownRenderer();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { shouldAutoScroll, scrollToBottom, resetStreamingState, forceScrollToBottom } = useAutoScroll(messageContainerRef);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [refreshChatList, setRefreshChatList] = useState(0);
  const [isNewChat, setIsNewChat] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) {
          router.push('/login');
        }
      }
    }
  }, [loading, user, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load previous messages on component mount or when chat ID changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChatId || !user) return;
      
      const messagesRef = collection(db, "chats", currentChatId, "messages");
      const q = query(messagesRef, orderBy("message_order", "asc"));
      const querySnapshot = await getDocs(q);
      
      const loadedMessages = querySnapshot.docs.map(doc => ({
        role: doc.data().role,
        content: doc.data().content
      }));
      
      setMessages(loadedMessages);
    };

    loadMessages();
  }, [currentChatId, user]);

  // Modifier la fonction createNewChat pour inclure le premier message
  const createNewChat = async (firstMessage: string) => {
    if (!user) return;
    try {
      // Créer le chat avec le titre basé sur le premier message
      const chatRef = await addDoc(collection(db, "chats"), {
        userId: user.uid,
        created_at: new Date(),
        last_updated: new Date(),
        title: generateChatTitle(firstMessage)
      });
      
      // Ajouter immédiatement le premier message
      const messagesRef = collection(db, "chats", chatRef.id, "messages");
      await addDoc(messagesRef, {
        content: firstMessage,
        role: 'user',
        message_order: 1,
        timestamp: new Date()
      });

      setCurrentChatId(chatRef.id);
      await incrementUserChatCount(user.uid, chatRef.id);
      await incrementUserMessageCount(user.uid);
      setRefreshChatList(prev => prev + 1); // Ajouter cette ligne à la fin
      return chatRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    setCurrentChatId(chatId);
    setMessages([]);
    setIsNewChat(false); // Ajout de cette ligne
    // Les messages seront chargés via useEffect quand currentChatId change
  };

  const addMessageToFirestore = async (content: string, role: string) => {
    if (!currentChatId || !user) return;

    const messagesRef = collection(db, "chats", currentChatId, "messages");
    const messageCount = (await getDocs(query(messagesRef, orderBy("message_order", "desc")))).size;

    await addDoc(messagesRef, {
      content,
      role,
      message_order: messageCount + 1,
      timestamp: new Date()
    });

    // Increment message count for user
    if (role === 'user') {
      await incrementUserMessageCount(user.uid);
    }

    // Update chat's last_updated timestamp
    const chatRef = doc(db, "chats", currentChatId);
    await updateDoc(chatRef, {
      last_updated: new Date()
    });
  };

  const handleStreamingUpdate = async (newContent: string) => {
    currentMessageRef.current = newContent;
    setMessages(prev => [
      ...prev.slice(0, -1),
      { role: 'assistant', content: newContent }
    ]);
    scrollToBottom(true);
  };

  // Modifier handleSubmit pour gérer la création du chat avec le premier message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    resetStreamingState();
    const userMessage = { role: 'user', content: input };
    
    // Update UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    currentMessageRef.current = '';
    forceScrollToBottom();
    setIsNewChat(false);

    try {
      let chatId = currentChatId;
      // Créer un nouveau chat avec le premier message si nécessaire
      if (!chatId) {
        const newChatId = await createNewChat(input);
        if (!newChatId) throw new Error("Failed to create chat");
        chatId = newChatId; // Stocker l'ID du nouveau chat
      } else {
        // Si le chat existe déjà, ajouter simplement le message
        await addMessageToFirestore(input, 'user');
      }

      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Send request with context
      const response = await chatgpt(
        input,
        conversationHistory,
        undefined,
        'gpt-4o',
        true
      );

      if (typeof response !== 'string') {
        setIsLoading(false);
        setIsStreaming(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        
        let accumulatedContent = '';
        for await (const chunk of response) {
          accumulatedContent += chunk;
          await handleStreamingUpdate(accumulatedContent);
        }
        
        // Utiliser chatId au lieu de currentChatId
        const messagesRef = collection(db, "chats", chatId, "messages");
        const messageCount = (await getDocs(query(messagesRef, orderBy("message_order", "desc")))).size;
        
        // Store complete assistant response
        await addDoc(messagesRef, {
          content: accumulatedContent,
          role: 'assistant',
          message_order: messageCount + 1,
          timestamp: new Date()
        });
        
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        // Utiliser chatId au lieu de currentChatId
        const messagesRef = collection(db, "chats", chatId, "messages");
        const messageCount = (await getDocs(query(messagesRef, orderBy("message_order", "desc")))).size;
        
        await addDoc(messagesRef, {
          content: response,
          role: 'assistant',
          message_order: messageCount + 1,
          timestamp: new Date()
        });
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
      forceScrollToBottom(); // Force le scroll à la fin
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

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInput('');
    setIsNewChat(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="chat-container">
      <AuthNav userEmail={user.email || ''} />
      <div className="chat-layout">
        <ChatList 
          userId={user.uid}
          onChatSelect={handleChatSelect}
          currentChatId={currentChatId}
          refreshTrigger={refreshChatList}
          onNewChat={handleNewChat} // Add this prop
        />
        <div className="chat-main">
          <div id="chat-box" className="chat-box" ref={messageContainerRef}>
            {!isNewChat && messages.map((msg, index) => (
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
            
            {isNewChat && (
              <div className="welcome-message">
                Besoin d&apos;aide ? Posez-moi vos questions !
              </div>
            )}
            
            {isLoading && !isStreaming && (
              <div className="message-container assistant-container reflection-message">
                <div className="message-logo">
                  <Image src="/logo.png" alt="Assistant" width={40} height={40} />
                </div>
                <div className="message assistant reflection-text">
                  Réflexion en cours...
                </div>
              </div>
            )}
          </div>
          
          <div className={`input-container ${isNewChat ? 'centered' : 'bottom'}`}>
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
      <ThemeToggle />
    </div>
  );
}