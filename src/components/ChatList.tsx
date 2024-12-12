import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from '@firebase/firestore';
import Image from 'next/image';

interface Chat {
  id: string;
  title: string;
  created_at: Date;
}

interface ChatListProps {
  userId: string;
  onChatSelect: (chatId: string) => void;
  currentChatId: string | null;
  refreshTrigger?: number; // Nouveau prop
  onNewChat: () => void; // Add this prop
}

export const ChatList = ({ userId, onChatSelect, currentChatId, refreshTrigger, onNewChat }: ChatListProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadChats = async () => {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("userId", "==", userId),
        orderBy("created_at", "desc")
      );

      const querySnapshot = await getDocs(q);
      const chatList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || "Nouvelle conversation",
        created_at: doc.data().created_at.toDate()
      }));

      setChats(chatList);
    };

    if (userId) {
      loadChats();
    }
  }, [userId, refreshTrigger]); // Ajouter refreshTrigger comme dépendance

  useEffect(() => {
    const layout = document.querySelector('.chat-layout');
    if (layout) {
      if (isOpen) {
        layout.classList.add('sidebar-open');
      } else {
        layout.classList.remove('sidebar-open');
      }
    }
  }, [isOpen]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className={`sidebar-controls ${isOpen ? 'open' : ''}`}>
        <button 
          className={`toggle-sidebar ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Image 
            src="/icons/sidebar-icon.png" 
            alt="Toggle Sidebar"
            width={20}
            height={20}
          />
        </button>
        <button 
          className="new-chat-button"
          onClick={onNewChat}
        >
          <Image 
            src="/icons/add-new-chat-icon.png" 
            alt="New Chat"
            width={20}
            height={20}
          />
        </button>
      </div>
      
      <div className={`chat-list ${isOpen ? 'open' : 'closed'}`}>
        <div className="chat-list-content">
          <h2>Conversations</h2>
          <div className="chat-items">
            {mounted && chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
                onClick={() => onChatSelect(chat.id)}
              >
                <span className="chat-title">{chat.title}</span>
                <span className="chat-date">
                  {mounted ? formatDate(chat.created_at) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
