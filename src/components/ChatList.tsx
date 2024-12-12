import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from '@firebase/firestore';

interface Chat {
  id: string;
  title: string;
  created_at: Date;
}

interface ChatListProps {
  userId: string;
  onChatSelect: (chatId: string) => void;
  currentChatId: string | null;
}

export const ChatList = ({ userId, onChatSelect, currentChatId }: ChatListProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isOpen, setIsOpen] = useState(true);

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
  }, [userId]);

  return (
    <div className={`chat-list ${isOpen ? 'open' : 'closed'}`}>
      <button 
        className="toggle-sidebar"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '←' : '→'}
      </button>
      
      <div className="chat-list-content">
        <h2>Conversations</h2>
        <div className="chat-items">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
              onClick={() => onChatSelect(chat.id)}
            >
              <span className="chat-title">{chat.title}</span>
              <span className="chat-date">
                {chat.created_at.toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
