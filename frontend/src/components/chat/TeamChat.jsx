// src/components/workspace/TeamChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, MessageCircle, Minimize2 } from 'lucide-react';

const TeamChat = ({ messages = [], onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(2);
  const messagesEndRef = useRef(null);

  const defaultMessages = [
    { id: 1, author: 'System', content: 'Welcome to SDLC Studio! Start by describing your project idea.', time: 'Just now', isAI: true },
    { id: 2, author: 'Priya', content: 'I\'ve started working on the architecture diagram.', time: '2h ago', isAI: false },
  ];

  const displayMessages = messages.length > 0 ? messages : defaultMessages;

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayMessages, isOpen]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage?.(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getUserInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getUserColor = (name) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-slide-up">
          {/* Header - Lilly Red */}
          <div className="bg-gradient-to-r from-[#E11932] to-[#C81530] px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Project Updates</h3>
                <p className="text-xs text-red-100">5 team members</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {displayMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                {msg.isAI ? (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm ${getUserColor(msg.author)}`}>
                    {getUserInitials(msg.author)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {msg.isAI ? 'AI Assistant' : msg.author}
                    </span>
                    <span className="text-xs text-gray-400">{msg.time}</span>
                  </div>
                  <div className={`p-3 rounded-2xl rounded-tl-sm text-sm ${
                    msg.isAI 
                      ? 'bg-gradient-to-br from-purple-50 to-indigo-50 text-gray-800 border border-purple-100' 
                      : 'bg-white text-gray-700 shadow-sm border border-gray-100'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E11932] focus:bg-white transition"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  newMessage.trim() 
                    ? 'bg-[#E11932] text-white hover:bg-[#C81530] shadow-lg' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button - Lilly Red */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
          isOpen 
            ? 'bg-gray-700 hover:bg-gray-800' 
            : 'bg-gradient-to-r from-[#E11932] to-[#C81530] hover:from-[#C81530] hover:to-[#A3122A] hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
          </>
        )}
      </button>
    </>
  );
};

export default TeamChat;