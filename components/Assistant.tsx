import React, { useState, useRef, useEffect } from 'react';
import { continueChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import * as LucideReact from 'lucide-react';

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm your YouTube Growth Assistant. How can I help you grow your channel today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMessage];
      const modelResponse = await continueChat(history, input);
      setMessages(prev => [...prev, { role: 'model', content: modelResponse }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-8">
      <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Assistant</h1>
          <p className="text-slate-400 mt-1">Ask for video ideas, optimization tips, or channel advice.</p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-slate-800/50 rounded-lg pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xl p-3 rounded-xl bg-slate-700 text-slate-200 flex items-center">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse mr-2"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse mr-2 delay-150"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto flex items-center p-2 bg-slate-800 rounded-lg border border-slate-700">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask for 10 viral short ideas..."
          className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || input.trim() === ''}
          className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
          <LucideReact.Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Assistant;