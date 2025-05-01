
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatMessage, { MessageType } from './ChatMessage';
import { useToast } from '@/hooks/use-toast';

// Initial messages that will be shown when the chat is opened
const initialMessages: MessageType[] = [
  {
    id: '1',
    content: 'Hey there! I\'m the impulse assistant. How can I help you?',
    isUser: false,
    timestamp: new Date(),
  }
];

// Sample responses for basic questions
const sampleResponses: Record<string, string> = {
  'hello': 'Hi there! How can I assist you with impulse today?',
  'hi': 'Hello! How can I help you with impulse?',
  'hey': 'Hey! What can I do for you today?',
  'how to create a meetup': 'To create a meetup, go to the home page and click on "Create New Meetup" button. Fill in the details and publish it!',
  'how to join an event': 'You can join events by browsing the events page, clicking on an event that interests you, and then clicking the "Join" button.',
  'what is impulse': 'Impulse is a platform for UTD students to discover campus events, create meetups, and connect with fellow students.',
  'how do i earn points': 'You can earn points by attending events, creating meetups, and participating in activities on campus. Points help you level up!',
  'how to scan qr code': 'When you\'re at an event, tap the QR code scanner in the event lobby and scan the event QR code to check in.',
  'help': 'I can help you with information about events, meetups, points, and general navigation of the impulse app. Just ask me a question!'
};

interface ChatBotProps {}

const ChatBot: React.FC<ChatBotProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking and responding
    setTimeout(() => {
      const botResponse = generateResponse(inputMessage.trim().toLowerCase());
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const generateResponse = (userInput: string): string => {
    // Check for exact matches in sample responses
    if (sampleResponses[userInput]) {
      return sampleResponses[userInput];
    }

    // Check for partial matches
    for (const [key, response] of Object.entries(sampleResponses)) {
      if (userInput.includes(key)) {
        return response;
      }
    }

    // Default response if no match is found
    return "I'm not sure how to help with that specific question. You could try asking about how to create a meetup, join events, or earn points!";
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Chat toggle button */}
      <Button 
        onClick={toggleChat} 
        className="rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 h-96 bg-background border rounded-lg shadow-lg flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-3 border-b bg-muted flex justify-between items-center">
            <h3 className="font-semibold text-sm">impulse Assistant</h3>
            <Button variant="ghost" size="icon" onClick={toggleChat}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-muted text-foreground max-w-[75%] rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={inputMessage.trim() === ''}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
