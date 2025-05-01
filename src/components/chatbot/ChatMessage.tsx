
import React from 'react';

export type MessageType = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div 
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div 
        className={`max-w-[75%] rounded-lg px-4 py-2 ${
          message.isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-foreground'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
