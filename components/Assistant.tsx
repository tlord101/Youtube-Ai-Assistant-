import React, { useState, useRef, useEffect } from 'react';
import { continueChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import * as LucideReact from 'lucide-react';
import { useProjects } from '../contexts/ProjectsContext';
import useLocalStorage from '../hooks/useLocalStorage';

const SuggestionChip: React.FC<{text: string, onClick: (text: string) => void}> = ({ text, onClick }) => (
    <button 
        onClick={() => onClick(text)}
        className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-full transition-colors"
    >
        {text}
    </button>
);


const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm your YouTube Growth Assistant. How can I help you grow your channel today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeProject } = useProjects();

  const [promptCount, setPromptCount] = useLocalStorage('ytg-prompt-count', 0);
  const [cooldownEndTime, setCooldownEndTime] = useLocalStorage<number | null>('ytg-cooldown-end', null);
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    if (cooldownEndTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = cooldownEndTime - now;

        if (distance < 0) {
          clearInterval(interval);
          setCooldownEndTime(null);
          setPromptCount(0);
          setRemainingTime('');
        } else {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [cooldownEndTime, setCooldownEndTime, setPromptCount]);


  const suggestionPrompts = [
      `Suggest 5 viral short ideas for a "${activeProject?.niche || 'general'}" channel`,
      `Brainstorm 3 tutorial topics for my target audience: ${activeProject?.targetAudience || 'beginners'}`,
      `Give me some catchy video titles about "${activeProject?.contentType || 'my content'}"`,
      `How can I improve my video descriptions for better SEO?`
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  const isLimited = promptCount >= 3 && cooldownEndTime;

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading || isLimited) return;
    
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    const newCount = promptCount + 1;
    setPromptCount(newCount);
    
    if (newCount >= 3) {
      const threeHoursInMillis = 3 * 60 * 60 * 1000;
      setCooldownEndTime(new Date().getTime() + threeHoursInMillis);
    }

    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMessage];
      const modelResponse = await continueChat(history, input, activeProject);
      setMessages(prev => [...prev, { role: 'model', content: modelResponse }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (prompt: string) => {
      if (!isLimited) {
          setInput(prompt);
      }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-8">
      <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Assistant</h1>
          <p className="text-slate-400 mt-1">
              {activeProject 
                ? `Ask anything about your channel: "${activeProject.channelName}"`
                : "Ask for video ideas, optimization tips, or channel advice."
              }
          </p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-slate-800/50 rounded-lg pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
              <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900/50 p-3 rounded-md my-2 text-sm"><code>$1</code></pre>').replace(/`([^`]+)`/g, '<code class="bg-slate-900/50 px-1 py-0.5 rounded">$1</code>') }} />
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xl p-3 rounded-xl bg-slate-700 text-slate-200 flex items-center">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse mr-2 delay-75"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse mr-2 delay-150"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200"></span>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mb-3 flex flex-wrap gap-2 justify-center">
        {suggestionPrompts.map(prompt => <SuggestionChip key={prompt} text={prompt} onClick={handleSuggestionClick} />)}
      </div>

      {isLimited && (
        <div className="text-center text-yellow-400 bg-yellow-500/10 p-3 rounded-lg mb-3 text-sm">
          <div className="flex items-center justify-center">
            <LucideReact.Clock className="w-4 h-4 mr-2" />
            <span>Limit exceeded. Please wait <strong>{remainingTime}</strong> to send another message.</span>
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center p-2 bg-slate-800 rounded-lg border border-slate-700">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isLimited ? "You have reached your message limit" : "Ask for 10 viral short ideas..."}
          className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 disabled:cursor-not-allowed"
          disabled={isLoading || isLimited}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || input.trim() === '' || isLimited}
          className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
        >
          <LucideReact.Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Assistant;