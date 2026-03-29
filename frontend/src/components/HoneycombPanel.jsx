import React, { useState, useEffect } from 'react';
import HiveService from '../services/HiveService';

const beeImages = [
    "/images/750x376-0-0-1-80-Honey_bees.jpg",
    "/images/AdobeStock_55074318.webp",
    "/images/IMG_4831.jpg",
    "/images/TAL-header-wildflowers-crested-butte-colorado-COFLOWERS0424-a35f8aa3de75417ca1a98417835c2a58.jpg",
    "/images/Unknown-4.jpeg",
    "/images/hero-bee-image.webp",
    "/images/istockphoto-956332184-612x612.jpg"
];

const HoneycombPanel = ({ selectedHive, onSelectHive }) => {
    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        type: '',
        queen_age: new Date().getFullYear(),
        strength: 30000,
        weight: '',
        notes: ''
    });
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        fetchHives();
    }, []);

    const fetchHives = async () => {
        try {
            setLoading(true);
            const data = await HiveService.getAllHives();
            setHives(data);
            
            // If there's an active selected hive, we might want to update it
            if (selectedHive) {
                const updatedSelected = data.find(h => h.id === selectedHive.id);
                if (updatedSelected) onSelectHive(updatedSelected);
            }
        } catch (error) {
            console.error("Error fetching hives:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHive = async (e) => {
        e.preventDefault();
        try {
            await HiveService.createHive({
                ...formData,
                weight: parseFloat(formData.weight) || 0,
                status: 'Aktivno'
            });
            setIsModalOpen(false);
            setFormData({ name: '', location: '', type: '', queen_age: new Date().getFullYear(), strength: 30000, weight: '', notes: '' });
            fetchHives();
        } catch (error) {
            console.error("Error creating hive:", error);
        }
    };

    const handleEditHive = async (e) => {
        e.preventDefault();
        try {
            await HiveService.updateHive(selectedHive.id, {
                ...editFormData,
                weight: parseFloat(editFormData.weight) || 0,
                strength: parseInt(editFormData.strength) || 0
            });
            setIsEditModalOpen(false);
            fetchHives();
        } catch (error) {
            console.error("Error updating hive:", error);
            alert("Napaka pri urejanju panja: " + (error.response?.data?.message || error.message));
        }
    };

    const toggleMenu = (e, id) => {
        e.stopPropagation();
        setMenuOpenId(menuOpenId === id ? null : id);
    };

    const handleStatusChange = async (e, id, newStatus) => {
        e.stopPropagation();
        setMenuOpenId(null);
        try {
            await HiveService.updateHive(id, { status: newStatus });
            fetchHives();
        } catch (error) { console.error("Error updating status:", error); }
    };

    const handleDeleteHive = async (e, id) => {
        e.stopPropagation();
        setMenuOpenId(null);
        if (window.confirm("Res želite izbrisati ta panj?")) {
            try {
                const delId = id; // Store id to check against selected
                await HiveService.deleteHive(delId);
                fetchHives();
                if (selectedHive && selectedHive.id === delId) {
                    onSelectHive(null);
                }
            } catch (error) { console.error("Error deleting hive:", error); }
        }
    };

    const getStatusColor = (status) => {
        if (status === 'Spanje') return "bg-blue-500 text-white";
        return "bg-green-500 text-white";
    };

    // Restructure items into physical honeycomb rows (5, 4, 5, 4...)
    const getHoneycombRows = () => {
        const allItems = [...hives, { id: 'new-hive', isAddButton: true }];
        const rows = [];
        let currentIndex = 0;
        let isFiveRow = true;
        
        while (currentIndex < allItems.length) {
            const capacity = isFiveRow ? 5 : 4;
            rows.push({
                id: `row-${currentIndex}`,
                items: allItems.slice(currentIndex, currentIndex + capacity),
                isFiveRow: isFiveRow,
                rowIndex: rows.length
            });
            currentIndex += capacity;
            isFiveRow = !isFiveRow;
        }
        return rows;
    };

    return (
        <div className="w-full py-8 overflow-x-hidden flex justify-center" onClick={() => setMenuOpenId(null)}>
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="w-full relative flex justify-center pt-5 pb-10">
                    <div className="flex flex-col items-start w-[932px]">
                        {getHoneycombRows().map((row) => (
                            <div 
                                key={row.id}
                                className={`flex w-full justify-start gap-x-2 ${row.rowIndex > 0 ? '-mt-[52px]' : ''} ${!row.isFiveRow ? 'pl-[94px]' : ''}`}
                                style={{ zIndex: 40 - row.rowIndex, position: 'relative' }}
                            >
                                {row.items.map((item) => {
                                    if (item.isAddButton) {
                                        return (
                                            <div 
                                                key="add-btn"
                                                onClick={() => setIsModalOpen(true)}
                                                className="group relative cursor-pointer w-[180px] h-[208px] transition-all duration-300 hover:scale-105"
                                            >
                                                <div className="absolute inset-0 m-[2px] hexagon bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/10 transition-colors duration-300 flex flex-col items-center justify-center text-gray-400 group-hover:text-primary">
                                                    <span className="material-symbols-outlined text-4xl mb-2">add_circle</span>
                                                    <span className="font-bold text-sm tracking-wide">Nov Panj</span>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const hive = item;
                                    const isSelected = selectedHive && selectedHive.id === hive.id;

                                    return (
                                        <div 
                                            key={hive.id}
                                            className={`group relative w-[180px] h-[208px] transition-all duration-300 ${isSelected ? 'scale-105' : 'hover:scale-105'}`}
                                        >
                                            {/* Inner Hexagon */}
                                            <div 
                                                onClick={() => onSelectHive(hive)}
                                                className={`absolute inset-0 m-[2px] hexagon overflow-hidden cursor-pointer transition-colors duration-300 ${isSelected ? 'shadow-[0_0_25px_rgba(245,180,0,0.8)] bg-primary border-4 border-yellow-200' : 'bg-white dark:bg-card-dark border-2 border-gray-200 dark:border-gray-700 hover:border-primary'}`}
                                            >
                                                {/* Bee Image BG */}
                                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                                    <img src={beeImages[hive.id % beeImages.length]} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm mb-2 ${isSelected ? 'bg-black text-primary' : 'bg-primary text-black'}`}>
                                                        #{hives.length - hives.findIndex(h => h.id === hive.id)}
                                                    </div>
                                                    <h3 className={`font-bold text-lg mb-1 leading-snug line-clamp-2 ${isSelected ? 'text-black' : 'text-gray-900 dark:text-white group-hover:text-primary'}`}>{hive.name}</h3>
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>{hive.weight || 0} kg</p>
                                                    
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusColor(hive.status)}`}>
                                                        {hive.status || 'Aktivno'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Menu Dots */}
                                            <div className="absolute top-[45px] right-3 bg-white/70 backdrop-blur rounded-full p-0.5 shadow-sm cursor-pointer z-30 hover:bg-white transition-opacity opacity-80 group-hover:opacity-100" onClick={(e) => toggleMenu(e, hive.id)}>
                                                <span className="material-symbols-outlined text-gray-800 text-sm">more_vert</span>
                                                {menuOpenId === hive.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-40 overflow-hidden text-left">
                                                        <div className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); setEditFormData(hive); setIsEditModalOpen(true); setMenuOpenId(null); }}>Uredi</div>
                                                        <div className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100" onClick={(e) => handleStatusChange(e, hive.id, 'Aktivno')}>Aktivno</div>
                                                        <div className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100" onClick={(e) => handleStatusChange(e, hive.id, 'Spanje')}>Spanje</div>
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                        <div className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50" onClick={(e) => handleDeleteHive(e, hive.id)}>Izbriši</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Honey Drip Animations */}
                                            {isSelected && (
                                                <>
                                                    <div className="absolute left-1/2 top-[206px] -ml-[4px] w-[8px] bg-[#f5b400] z-0 pointer-events-none animate-honey-leak shadow-[0_0_10px_rgba(245,180,0,0.8)]"></div>
                                                    <div className="absolute left-[25%] top-[180px] -ml-[3px] w-[6px] bg-[#f5b400]/90 z-0 pointer-events-none animate-honey-leak shadow-[0_0_8px_rgba(245,180,0,0.6)]" style={{ animationDelay: '0.2s', transformOrigin: 'top' }}></div>
                                                    <div className="absolute left-[75%] top-[180px] -ml-[3px] w-[6px] bg-[#f5b400]/90 z-0 pointer-events-none animate-honey-leak shadow-[0_0_8px_rgba(245,180,0,0.6)]" style={{ animationDelay: '0.4s', transformOrigin: 'top' }}></div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals from Hives.jsx */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">add_circle</span>
                            Dodaj nov panj
                        </h2>
                        <form onSubmit={handleAddHive} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Ime panja</label>
                                <input required type="text" className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Vpišite ime (npr. Panj #12)" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Lokacija</label>
                                <input type="text" className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Sledite svoji lokaciji" />
                            </div>
                            <div className="grid grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Tip</label>
                                    <input type="text" className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="LR, AŽ" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Matica</label>
                                    <input type="number" className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none" value={formData.queen_age} onChange={e => setFormData({...formData, queen_age: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Čebele</label>
                                    <input type="number" step="1000" className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none" value={formData.strength} onChange={e => setFormData({...formData, strength: parseInt(e.target.value) || 0})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Teža (kg)</label>
                                <input type="number" step="0.1" className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="42.5" />
                            </div>
                            <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 mt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Prekliči</button>
                                <button type="submit" className="px-6 py-2.5 bg-primary text-black font-black uppercase text-sm rounded-xl hover:bg-primary-hover shadow-lg">Shrani panj</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit</span>
                            Uredi panj
                        </h2>
                        <form onSubmit={handleEditHive} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ime panja</label>
                                <input required type="text" className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none" value={editFormData.name || ''} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Teža (kg)</label>
                                <input type="number" step="0.1" className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none" value={editFormData.weight !== null && editFormData.weight !== undefined ? editFormData.weight : ''} onChange={e => setEditFormData({...editFormData, weight: e.target.value})}/>
                            </div>
                            <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 mt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Prekliči</button>
                                <button type="submit" className="px-6 py-2.5 bg-primary text-black font-black uppercase text-sm rounded-xl">Posodobi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HoneycombPanel;
