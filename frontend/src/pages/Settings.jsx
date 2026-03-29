import React, { useState, useEffect, useRef } from 'react';
import UserService from '../services/UserService';
import HiveService from '../services/HiveService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customMarker = new L.Icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><path fill="#f5b400" stroke="#fff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'),
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('profil');
    const [mapMarkers, setMapMarkers] = useState([]);
    const [loadingMap, setLoadingMap] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (activeTab === 'lokacija') {
            const loadMapData = async () => {
                setLoadingMap(true);
                try {
                    const hivesData = await HiveService.getAllHives();
                    const locations = Array.from(new Set(hivesData.map(h => h.location).filter(Boolean)));
                    
                    const markers = [];
                    for (const locStr of locations) {
                        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locStr)}&count=1&language=en&format=json`);
                        const geoData = await geoRes.json();
                        if (geoData.results && geoData.results.length > 0) {
                            markers.push({
                                location: locStr,
                                lat: geoData.results[0].latitude,
                                lng: geoData.results[0].longitude,
                                count: hivesData.filter(h => h.location === locStr).length
                            });
                        }
                    }
                    setMapMarkers(markers);
                } catch (error) {
                    console.error("Failed to load map data.", error);
                } finally {
                    setLoadingMap(false);
                }
            };
            loadMapData();
        }
    }, [activeTab]);

    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        hive_type: 'AŽ Panj',
        ai_alarms: true,
        disease_detection: false,
        email_notifications: true,
        sms_alerts: false,
        ai_language: 'slovenščina',
        avatar_url: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await UserService.getProfile();
                setProfile({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    hive_type: data.hive_type || 'AŽ Panj',
                    ai_alarms: data.ai_alarms ?? true,
                    disease_detection: data.disease_detection ?? false,
                    email_notifications: data.email_notifications ?? true,
                    sms_alerts: data.sms_alerts ?? false,
                    ai_language: data.ai_language || 'slovenščina',
                    avatar_url: data.avatar_url || ''
                });
            } catch (err) {
                console.error("Failed to load profile:", err);
                setError("Napaka pri nalaganju profila.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleToggle = (field) => {
        setProfile((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile((prev) => ({ ...prev, avatar_url: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setProfile((prev) => ({ ...prev, avatar_url: '' }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        setError(null);
        try {
            await UserService.updateProfile(profile);
            setMessage("Spremembe so bile uspešno shranjene!");
            window.dispatchEvent(new CustomEvent('profile_updated'));
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error(err);
            setError("Sprememb ni bilo mogoče shraniti.");
            setTimeout(() => setError(null), 3000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="max-w-7xl mx-auto px-4 py-20 w-full flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 lg:px-12 w-full">
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Sidebar Navigation */}
                <aside className="w-full lg:w-64 flex flex-col gap-1">
                    <button 
                        onClick={() => setActiveTab('profil')} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold group text-left transition-colors ${activeTab === 'profil' ? 'bg-primary/20 text-yellow-800 dark:text-yellow-600' : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 opacity-80'}`}
                    >
                        <span className="material-symbols-outlined">person</span>
                        <span>Profil</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('lokacija')} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold group text-left transition-colors ${activeTab === 'lokacija' ? 'bg-primary/20 text-yellow-800 dark:text-yellow-600' : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 opacity-80'}`}
                    >
                        <span className="material-symbols-outlined">location_on</span>
                        <span>Lokacija čebelnjaka</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('paket')} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold group text-left transition-colors ${activeTab === 'paket' ? 'bg-primary/20 text-yellow-800 dark:text-yellow-600' : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 opacity-80'}`}
                    >
                        <span className="material-symbols-outlined">card_membership</span>
                        <span>Naročniški paket</span>
                    </button>
                </aside>

                {/* Right Content Pane */}
                <div className="flex-1 bg-white dark:bg-[#2d281a] rounded-xl shadow-sm border border-black/5 dark:border-white/5 overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-black/5 dark:border-white/5 relative">
                        {message && (
                            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded absolute top-2 right-8 z-10 animate-fade-in-down shadow-md">
                                <span className="block sm:inline">{message}</span>
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded absolute top-2 right-8 z-10 animate-fade-in-down shadow-md">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <h2 className="text-3xl font-black tracking-tight mb-1 text-slate-900 dark:text-white">
                            {activeTab === 'profil' && 'Nastavitve Profili'}
                            {activeTab === 'lokacija' && 'Lokacija Čebelnjaka'}
                            {activeTab === 'paket' && 'Naročniški Paketi'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {activeTab === 'profil' && 'Upravljajte svoj profil in sistemske integracije'}
                            {activeTab === 'lokacija' && 'Določite geografsko pozicijo za natančne vremenske ocene'}
                            {activeTab === 'paket' && 'Pregled vaše trenutne naročnine MojČebelar PRO'}
                        </p>
                    </div>

                    {/* DYNAMIC CONTENT MAPPER */}
                    <div className="p-8 space-y-10 relative">
                        
                        {/* TAB: PROFIL */}
                        {activeTab === 'profil' && (
                            <>
                                <section>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div 
                                            className="w-20 h-20 rounded-xl bg-background-light dark:bg-background-dark border border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden bg-cover bg-center shadow-inner" 
                                            style={{backgroundImage: profile.avatar_url ? `url('${profile.avatar_url}')` : "url('https://ui-avatars.com/api/?name=U+P&background=f5b400&color=fff')"}}
                                        >
                                            {!profile.avatar_url && <span className="material-symbols-outlined text-4xl text-gray-400 opacity-50">person</span>}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Profilna slika</h3>
                                            <div className="flex gap-2 mt-2">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    ref={fileInputRef} 
                                                    onChange={handleImageUpload} 
                                                    className="hidden" 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="text-xs font-bold py-1.5 px-3 bg-primary hover:bg-[#e0a500] text-black rounded-lg transition-colors"
                                                >
                                                    Naloži novo
                                                </button>
                                                {profile.avatar_url && (
                                                    <button 
                                                        type="button" 
                                                        onClick={removeImage}
                                                        className="text-xs font-bold py-1.5 px-3 border border-gray-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                                    >
                                                        Odstrani
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold block text-slate-800 dark:text-slate-200">Ime</label>
                                            <input type="text" name="first_name" value={profile.first_name} onChange={handleChange} className="w-full bg-background-light dark:bg-background-dark border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold block text-slate-800 dark:text-slate-200">Priimek</label>
                                            <input type="text" name="last_name" value={profile.last_name} onChange={handleChange} className="w-full bg-background-light dark:bg-background-dark border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold block text-slate-800 dark:text-slate-200">E-poštni naslov</label>
                                            <input type="email" name="email" value={profile.email} onChange={handleChange} disabled className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-lg p-3 text-slate-500 cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold block text-slate-800 dark:text-slate-200">Telefonska številka</label>
                                            <input type="tel" name="phone" value={profile.phone} onChange={handleChange} placeholder="+386 41 123 456" className="w-full bg-background-light dark:bg-background-dark border-none rounded-lg p-3 focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white" />
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-black/5 dark:border-white/5" />

                                <section>
                                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Preferirani tip panjev</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {['AŽ Panj', 'LR Panj', 'Dadant'].map(type => (
                                            <label key={type} className={`cursor-pointer rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all border-2 ${profile.hive_type === type ? 'border-primary bg-primary/5' : 'border-transparent bg-background-light dark:bg-background-dark hover:border-primary/50'}`}>
                                                <input type="radio" name="hive_type" value={type} checked={profile.hive_type === type} onChange={handleChange} className="hidden" />
                                                <span className={`material-symbols-outlined text-4xl ${profile.hive_type === type ? 'text-primary' : 'opacity-60 text-slate-900 dark:text-white'}`}>
                                                    {type === 'AŽ Panj' ? 'inventory_2' : type === 'LR Panj' ? 'layers' : 'shelves'}
                                                </span>
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </section>

                                <hr className="border-black/5 dark:border-white/5" />

                                <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">AI Asistent Profil</h3>
                                        <div className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-xl">
                                            <div className="w-full">
                                                <p className="font-bold text-sm text-slate-900 dark:text-white mb-2">Jezik AI bota (DeepSeek)</p>
                                                <select 
                                                    name="ai_language" 
                                                    value={profile.ai_language} 
                                                    onChange={handleChange}
                                                    className="w-full bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                                >
                                                    <option value="slovenščina">Slovenščina (Privzeto)</option>
                                                    <option value="english">English</option>
                                                    <option value="deutsch">Deutsch</option>
                                                    <option value="hrvatski">Hrvatski</option>
                                                </select>
                                                <p className="text-xs text-gray-500 mt-2">Določa prevodni sistem globalnega bota.</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Sistemska obvestila</h3>
                                        <div className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-xl">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">E-poštna obvestila</p>
                                                <p className="text-xs text-gray-500">Zaloge in opravila</p>
                                            </div>
                                            <button type="button" onClick={() => handleToggle('email_notifications')} className={`w-12 h-6 rounded-full relative p-1 flex items-center transition-colors ${profile.email_notifications ? 'bg-primary justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'}`}>
                                                <span className="w-4 h-4 bg-white rounded-full shadow-sm relative transform transition-transform"></span>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-xl">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">SMS opozorila</p>
                                                <p className="text-xs text-gray-500">Samo za rojenje in krajo</p>
                                            </div>
                                            <button type="button" onClick={() => handleToggle('sms_alerts')} className={`w-12 h-6 rounded-full relative p-1 flex items-center transition-colors ${profile.sms_alerts ? 'bg-primary justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'}`}>
                                                <span className="w-4 h-4 bg-white rounded-full shadow-sm relative transform transition-transform"></span>
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <div className="pt-6 border-t border-black/5 dark:border-white/5 flex justify-end">
                                    <button 
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={`flex items-center gap-2 bg-primary hover:bg-[#e0a500] text-black font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 ${saving && 'opacity-70 cursor-not-allowed'}`}
                                    >
                                        {saving ? (
                                            <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                                        ) : (
                                            <span className="material-symbols-outlined">save</span>
                                        )}
                                        Shrani spremembe
                                    </button>
                                </div>
                            </>
                        )}

                        {/* TAB: LOKACIJA */}
                        {activeTab === 'lokacija' && (
                            <div className="animate-fade-in-up h-[450px] w-full rounded-2xl overflow-hidden shadow-inner border border-black/5 dark:border-white/5 relative z-0">
                                {loadingMap ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800 z-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                                        <p className="text-sm font-bold text-gray-500">Iskanje geolokacij panjev...</p>
                                    </div>
                                ) : mapMarkers.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800 z-10 p-6 text-center">
                                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Prazno! Ni določenih lokacij.</h3>
                                        <p className="text-sm text-gray-500 max-w-sm">Dodajte lokacije (npr. 'Maribor') v zavihku 'Panji', da se prikažejo tu.</p>
                                    </div>
                                ) : (
                                    <MapContainer 
                                        center={[46.1199, 14.8153]} 
                                        zoom={8} 
                                        style={{ height: '100%', width: '100%' }}
                                        zoomControl={false}
                                        className="leaflet-container-override z-0"
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                        />
                                        {mapMarkers.map((marker, i) => (
                                            <Marker key={i} position={[marker.lat, marker.lng]} icon={customMarker}>
                                                <Popup className="font-display">
                                                    <div className="font-bold text-slate-800 tracking-tight text-sm mb-1">{marker.location}</div>
                                                    <div className="text-xs text-gray-600">Aktivnih družin: <span className="font-black text-primary ml-1">{marker.count}</span></div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                )}
                            </div>
                        )}

                        {/* TAB: PAKET */}
                        {activeTab === 'paket' && (
                            <div className="animate-fade-in-up">
                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 border border-primary/20 rounded-2xl p-8 mb-6 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="bg-primary text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Aktivno</span>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-4">MojČebelar <span className="text-primary">PRO</span></h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Dostop do LLM asistentov in DeepSeek R1 analitike.</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white">€14.99</span>
                                            <span className="text-gray-500"> / mesec</span>
                                        </div>
                                    </div>
                                    <div className="mt-8 border-t border-black/5 dark:border-white/5 pt-6 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400">Naročnina se obnovi: 22. 04. 2026</span>
                                        <button className="text-sm font-bold text-red-600 hover:text-red-700 underline">Prekliči naročnino</button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </main>
    );
};

export default Settings;
