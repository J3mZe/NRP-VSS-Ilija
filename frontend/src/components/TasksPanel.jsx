import React, { useState, useEffect } from 'react';
import TaskService from '../services/TaskService';
import HiveService from '../services/HiveService';

const TasksPanel = ({ selectedHive }) => {
    const [tasks, setTasks] = useState([]);
    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [timeFilter, setTimeFilter] = useState('Vse');
    const [hiveFilter, setHiveFilter] = useState('Vsi panji');
    const [typeFilter, setTypeFilter] = useState('Vrsta opravila');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: 'Pregled',
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        hiveId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedHive) {
            setHiveFilter(selectedHive.id.toString());
            // Pre-fill form when open modal
            setFormData(prev => ({ ...prev, hiveId: selectedHive.id }));
        } else {
            setHiveFilter('Vsi panji');
        }
    }, [selectedHive]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksData, hivesData] = await Promise.all([
                TaskService.getAllTasks(),
                HiveService.getAllHives()
            ]);
            setTasks(tasksData);
            setHives(hivesData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.hiveId) payload.hiveId = null;
            await TaskService.createTask(payload);
            setIsModalOpen(false);
            setFormData({ title: 'Pregled', description: '', due_date: new Date().toISOString().split('T')[0], status: 'pending', hiveId: selectedHive ? selectedHive.id : '' });
            fetchData();
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData("taskId", taskId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        if (!taskId) return;

        const updatedTasks = tasks.map(t => t.id === parseInt(taskId) ? { ...t, status: newStatus } : t);
        setTasks(updatedTasks);

        try {
            await TaskService.updateTask(taskId, { status: newStatus });
        } catch (error) {
            console.error("Error updating task status:", error);
            fetchData();
        }
    };

    const handleCompleteTask = async (e, taskId) => {
        e.stopPropagation();
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t);
        setTasks(updatedTasks);
        try {
            await TaskService.updateTask(taskId, { status: 'completed' });
        } catch (error) {
            console.error("Error marking task complete:", error);
            fetchData();
        }
    };

    const handleDeleteTask = async (e, taskId) => {
        e.stopPropagation();
        if (window.confirm("Res želite izbrisati to opravilo?")) {
            try {
                await TaskService.deleteTask(taskId);
                fetchData();
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (hiveFilter !== 'Vsi panji' && task.hiveId !== parseInt(hiveFilter)) return false;
        if (typeFilter !== 'Vrsta opravila' && task.title !== typeFilter) return false;
        
        if (timeFilter !== 'Vse') {
            const today = new Date().toISOString().split('T')[0];
            const taskDate = task.due_date ? task.due_date.split('T')[0] : null;
            if (timeFilter === 'Danes' && taskDate !== today) return false;
        }
        
        return true;
    });

    const plannedTasks = filteredTasks.filter(t => t.status === 'pending');
    const todayTasks = filteredTasks.filter(t => t.status === 'today');
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');

    const getTaskTypeStyle = (title) => {
        switch (title) {
            case 'Zdravljenje': return 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300';
            case 'Krmljenje': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300';
            default: return 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getTaskTypeDot = (title) => {
        switch (title) {
            case 'Zdravljenje': return 'bg-red-500 animate-pulse';
            case 'Krmljenje': return 'bg-yellow-500';
            default: return 'bg-slate-400';
        }
    };

    if (loading) return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto my-10"></div>;

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#1d180c] dark:text-white flex items-center gap-2">
                        Opravila 
                        {selectedHive && <span className="text-sm bg-primary/20 text-black px-2 py-0.5 rounded-full border border-primary/30">Za panj: {selectedHive.name}</span>}
                    </h2>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-[#e0a500] text-black font-bold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group text-sm">
                    <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">add</span>
                    Novo opravilo
                </button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col xl:flex-row gap-4 mb-6 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-[#f4f0e6] dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex bg-background-light dark:bg-gray-900 p-1 rounded-lg border border-[#f4f0e6] dark:border-gray-700">
                        {['Vse', 'Danes', 'Ta teden', 'Ta mesec'].map(filter => (
                            <button 
                                key={filter}
                                onClick={() => setTimeFilter(filter)} 
                                className={`${timeFilter === filter ? 'bg-primary text-black shadow-sm' : 'text-[#1d180c] dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800'} px-3 py-1 text-xs font-bold rounded-md transition-colors`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    
                    <div className="h-6 w-px bg-[#f4f0e6] dark:bg-gray-700 mx-1"></div>
                    
                    <div className="relative min-w-32">
                        <select value={hiveFilter} onChange={e => setHiveFilter(e.target.value)} className="w-full bg-background-light dark:bg-gray-900 border-[#f4f0e6] dark:border-gray-700 rounded-lg text-xs font-medium py-1.5 pl-2 pr-8 focus:ring-primary focus:border-primary dark:text-gray-200">
                            <option value="Vsi panji">Vsi panji</option>
                            {hives.map(hive => (
                                <option key={hive.id} value={hive.id.toString()}>{hive.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="relative min-w-32">
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full bg-background-light dark:bg-gray-900 border-[#f4f0e6] dark:border-gray-700 rounded-lg text-xs font-medium py-1.5 pl-2 pr-8 focus:ring-primary focus:border-primary dark:text-gray-200">
                            <option value="Vrsta opravila">Vrsta opravila (Vse)</option>
                            <option value="Pregled">Pregled</option>
                            <option value="Zdravljenje">Zdravljenje</option>
                            <option value="Krmljenje">Krmljenje</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: NAČRTOVANO */}
                <div className="flex flex-col gap-3" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'pending')}>
                    <div className="flex items-center gap-2 px-1 text-slate-600 dark:text-gray-300 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <h3 className="text-xs font-black uppercase tracking-widest">Načrtovano</h3>
                        <span className="text-xs ml-auto font-bold">{plannedTasks.length}</span>
                    </div>
                    
                    <div className="flex flex-col gap-3 bg-[#f0f0eb]/50 dark:bg-gray-800/50 p-2 rounded-xl border-2 border-dashed border-[#e5e5de] dark:border-gray-700 transition-colors h-96 overflow-y-auto">
                        {plannedTasks.map(task => (
                            <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-[#f4f0e6] dark:border-gray-700 hover:shadow-md cursor-grab active:cursor-grabbing relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-lg ${getTaskTypeStyle(task.title)}`}>{task.title}</span>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 z-10">
                                        <button onClick={(e) => handleCompleteTask(e, task.id)} className="text-gray-300 hover:text-green-500"><span className="material-symbols-outlined text-[14px]">check_circle</span></button>
                                        <button onClick={(e) => handleDeleteTask(e, task.id)} className="text-gray-300 hover:text-red-500"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${getTaskTypeDot(task.title)} group-hover:opacity-0`}></div>
                                </div>
                                <h4 className="font-bold text-sm text-[#1d180c] dark:text-white mb-1 line-clamp-1">{task.hive ? task.hive.name : 'Splošno'}</h4>
                                <p className="text-xs text-[#a18845] line-clamp-2 mb-2">{task.description}</p>
                                <div className="flex items-center gap-1 text-slate-400 border-t border-[#f4f0e6] dark:border-gray-700 pt-2 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">event</span>
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Brez datuma'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: DANES */}
                <div className="flex flex-col gap-3" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'today')}>
                    <div className="flex items-center gap-2 px-1 text-black dark:text-white mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <h3 className="text-xs font-black uppercase tracking-widest">Danes</h3>
                        <span className="text-xs ml-auto font-bold">{todayTasks.length}</span>
                    </div>
                    
                    <div className="flex flex-col gap-3 bg-primary/5 p-2 rounded-xl border-2 border-primary/10 h-96 overflow-y-auto">
                        {todayTasks.map(task => (
                            <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} className={`bg-white dark:bg-gray-800 p-3 rounded-xl border-2 ${task.title === 'Zdravljenje' ? 'border-red-500' : 'border-primary'} shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing relative group overflow-hidden`}>
                                {task.title === 'Zdravljenje' && <div className="absolute top-0 right-0 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase">Nujno</div>}
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-lg ${getTaskTypeStyle(task.title)}`}>{task.title}</span>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 z-10">
                                        <button onClick={(e) => handleCompleteTask(e, task.id)} className="text-gray-300 hover:text-green-500"><span className="material-symbols-outlined text-[14px]">check_circle</span></button>
                                        <button onClick={(e) => handleDeleteTask(e, task.id)} className="text-gray-300 hover:text-red-500"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                    </div>
                                </div>
                                <h4 className="font-bold text-sm text-[#1d180c] dark:text-white mb-1 line-clamp-1">{task.hive ? task.hive.name : 'Splošno'}</h4>
                                <p className="text-xs text-[#a18845] line-clamp-2 mb-2">{task.description}</p>
                                <div className="flex items-center gap-1 text-black dark:text-gray-300 border-t border-[#f4f0e6] dark:border-gray-700 pt-2 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Brez datuma'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 3: OPRAVLJENO */}
                <div className="flex flex-col gap-3" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'completed')}>
                    <div className="flex items-center gap-2 px-1 text-green-700 dark:text-green-400 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <h3 className="text-xs font-black uppercase tracking-widest">Opravljeno</h3>
                        <span className="text-xs ml-auto font-bold">{completedTasks.length}</span>
                    </div>
                    
                    <div className="flex flex-col gap-3 bg-green-50/30 dark:bg-green-900/10 p-2 rounded-xl border-2 border-dashed border-green-100 dark:border-green-900/30 h-96 overflow-y-auto">
                        {completedTasks.map(task => (
                            <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-[#f4f0e6] dark:border-gray-700 opacity-60 hover:opacity-100 transition-opacity cursor-grab relative group">
                                <button onClick={(e) => handleDeleteTask(e, task.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 z-10"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-lg">{task.title}</span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-500 mb-1 line-through line-clamp-1">{task.hive ? task.hive.name : 'Splošno'}</h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-2 line-through">{task.description}</p>
                                <div className="flex items-center gap-1 text-slate-400 border-t border-slate-100 pt-2 text-[10px] font-bold line-through">
                                    <span className="material-symbols-outlined text-[12px]">done_all</span>
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Brez datuma'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Novo Opravilo Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">add_task</span> Novo Opravilo
                        </h2>
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Vrsta</label>
                                    <select value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-3 py-2 outline-none">
                                        <option value="Pregled">Pregled</option>
                                        <option value="Zdravljenje">Zdravljenje</option>
                                        <option value="Krmljenje">Krmljenje</option>
                                        <option value="Ostalo">Ostalo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Panj</label>
                                    <select value={formData.hiveId} onChange={e => setFormData({...formData, hiveId: e.target.value})} className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-3 py-2 outline-none">
                                        <option value="">Splošno</option>
                                        {hives.map(hive => (
                                            <option key={hive.id} value={hive.id}>{hive.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Opis</label>
                                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-3 py-2 outline-none"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Datum</label>
                                    <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-3 py-2 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-3 py-2 outline-none">
                                        <option value="pending">Načrtovano</option>
                                        <option value="today">Danes</option>
                                        <option value="completed">Opravljeno</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">Prekliči</button>
                                <button type="submit" className="px-5 py-2 bg-primary text-black font-black uppercase text-xs rounded-xl">Shrani</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksPanel;
