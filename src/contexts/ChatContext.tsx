import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  openChat: (prefilledMessage?: string) => void;
  closeChat: () => void;
  prefilledMessage: string;
  clearPrefilledMessage: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prefilledMessage, setPrefilledMessage] = useState('');

  const openChat = (message?: string) => {
    if (message) {
      setPrefilledMessage(message);
    }
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const clearPrefilledMessage = () => {
    setPrefilledMessage('');
  };

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        openChat,
        closeChat,
        prefilledMessage,
        clearPrefilledMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

