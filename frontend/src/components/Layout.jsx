import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AIAssistant from './AIAssistant';

const Layout = () => {
    const [isAIOpen, setIsAIOpen] = useState(false);

    const toggleAI = () => {
        setIsAIOpen(!isAIOpen);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-100 min-h-screen flex flex-col relative">
            <Navbar />
            <div className="flex-grow flex flex-col pt-16">
                <Outlet />
            </div>
            <Footer />
            
            {/* AI Assistant Chat Window Overlay */}
            <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

            {/* Global FAB from the original design */}
            <div className="fixed bottom-8 right-8 z-40 group">
                <button 
                    onClick={toggleAI}
                    className="bg-primary hover:bg-primary-hover w-16 h-16 flex items-center justify-center shadow-lg transition-transform transform hover:scale-105 focus:outline-none relative" 
                    style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                >
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isAIOpen ? 'close' : 'smart_toy'}
                    </span>
                    {!isAIOpen && (
                        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            AI Čebelarski Svetovalec
                        </span>
                    )}
                    <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 ${isAIOpen ? 'bg-red-500' : 'bg-primary-hover'} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out group-hover:translate-y-2`}></div>
                </button>
            </div>
        </div>
    );
};

export default Layout;
