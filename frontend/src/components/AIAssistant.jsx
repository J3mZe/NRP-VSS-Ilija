import React, { useState, useRef, useEffect } from 'react';
import AIService from '../services/AIService';

const AIAssistant = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Pozdravljeni! Sem vaš AI čebelarski svetovalec. Kako vam lahko pomagam danes?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Attempt context awareness by scraping the current URL path natively
            const contextStr = window.location.pathname;
            const res = await AIService.ask(userMessage, { currentRoute: contextStr });
            
            setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
            
            // Dispatch global event for the notification bell animation
            window.dispatchEvent(new CustomEvent('ai_response_received'));
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Oprostite, trenutno ne morem vzpostaviti povezave s strežnikom. Preverite API ključ in poskusite znova.' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-28 right-8 w-80 md:w-96 bg-white dark:bg-[#2d281a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 flex flex-col overflow-hidden animate-fade-in-up" style={{ maxHeight: '70vh', height: '500px' }}>
            {/* Header */}
            <div className="bg-primary text-black p-4 flex justify-between items-center rounded-t-2xl shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                    <h3 className="font-bold text-sm tracking-tight">AI Svetovalec</h3>
                </div>
                <button onClick={onClose} className="text-black/70 hover:text-black transition-colors p-1">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-black/20 flex flex-col gap-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-black text-white rounded-tr-none' 
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-black/5 dark:border-white/5 rounded-tl-none'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 shadow-sm border border-black/5 dark:border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center max-w-[50%]">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#2d281a] border-t border-gray-100 dark:border-gray-800">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Vprašajte o rojenju, varoji..."
                        className="w-full bg-slate-100 dark:bg-black/30 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-gray-200 border-none placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
                    >
                        <span className="material-symbols-outlined text-sm font-bold" style={{ marginLeft: '2px' }}>send</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIAssistant;
