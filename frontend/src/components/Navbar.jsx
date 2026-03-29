import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import UserService from '../services/UserService';
import TaskService from '../services/TaskService';

const Navbar = () => {
    const navigate = useNavigate();
    const [isShaking, setIsShaking] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [hasUnreadNotification, setHasUnreadNotification] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await UserService.getProfile();
                setUserProfile(data);
            } catch (err) { console.error(err); }
        };
        fetchUser();

        const checkTasks = async () => {
            try {
                const tasks = await TaskService.getAllTasks();
                const today = new Date().toISOString().split('T')[0];
                const dueToday = tasks.some(t => t.due_date && t.due_date.split('T')[0] === today && t.status !== 'completed');
                
                // Only alert them once per session until they explicitly acknowledge it today
                if (dueToday && localStorage.getItem('tasksAcknowledgedDate') !== today) {
                    setHasUnreadNotification(true);
                }
            } catch (err) { console.error(err); }
        };
        checkTasks();

        window.addEventListener('profile_updated', fetchUser);
        const handleAIResponse = () => {
            setIsShaking(true);
            setTimeout(() => {
                setIsShaking(false);
            }, 1000); // Shake for 1 second
        };

        window.addEventListener('ai_response_received', handleAIResponse);
        return () => {
            window.removeEventListener('ai_response_received', handleAIResponse);
            window.removeEventListener('profile_updated', fetchUser);
        };
    }, []);

    useEffect(() => {
        let interval;
        if (hasUnreadNotification) {
            // Trigger 10 second repeating animation ring
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 1000);
            
            interval = setInterval(() => {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 1000);
            }, 10000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [hasUnreadNotification]);

    const handleBellClick = () => {
        if (hasUnreadNotification) {
            setHasUnreadNotification(false);
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('tasksAcknowledgedDate', today);
        }
        navigate('/tasks');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-primary fixed top-0 w-full shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo & Nav Items */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-900 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>hive</span>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">MojČebelar</span>
                        </Link>
                        
                        {/* Desktop Nav */}
                        <div className="hidden md:flex space-x-1 group-nav">
                            <div className="nav-item relative group">
                                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-black/5 flex items-center transition-colors">
                                    Dashboard
                                </Link>
                            </div>
                            <div className="nav-item relative group">
                                <Link to="/reports" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-black/5 flex items-center transition-colors">
                                    Poročila
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        <button onClick={handleBellClick} className={`p-1 rounded-full text-gray-900 hover:bg-black/5 focus:outline-none ${isShaking ? 'animate-bounce text-primary drop-shadow-lg ring-2 ring-primary ring-offset-2' : ''} transition-all duration-300 relative`}>
                            {hasUnreadNotification && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-white"></span>}
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="relative nav-item group">
                            <button className="flex items-center space-x-2 text-gray-900 hover:bg-black/5 px-2 py-1 rounded-md focus:outline-none">
                                <img 
                                    alt="User profile" 
                                    className="h-8 w-8 rounded-full border border-gray-900/20 object-cover" 
                                    src={userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${userProfile?.first_name || 'U'}+${userProfile?.last_name || 'P'}&background=f5b400&color=fff`}
                                />
                                <span className="text-sm font-medium hidden sm:block">
                                    {userProfile?.first_name ? `${userProfile.first_name} ${userProfile.last_name || ''}` : 'Uporabnik'}
                                </span>
                                <span className="material-symbols-outlined text-sm ml-1">settings</span>
                            </button>
                            {/* Dropdown menu */}
                            <div className="absolute right-0 mt-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 hidden group-hover:block">
                                <div className="py-1">
                                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Nastavitve</Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Odjava</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
