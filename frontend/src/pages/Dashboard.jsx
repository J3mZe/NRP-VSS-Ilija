import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import DashboardService from '../services/DashboardService';

// New imported panels
import HoneycombPanel from '../components/HoneycombPanel';
import HealthPanel from '../components/HealthPanel';
import TasksPanel from '../components/TasksPanel';

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeHivesCount: 0,
        upcomingTasks: [],
        warnings: [],
        recentActivities: [],
        locations: ['Ljubljana']
    });
    
    // Unified State
    const [selectedHive, setSelectedHive] = useState(null);
    const detailsRef = useRef(null);

    const [loading, setLoading] = useState(true);
    
    // Weather state
    const [selectedLocation, setSelectedLocation] = useState('Ljubljana');
    const [weather, setWeather] = useState({
        temp: '--', humidity: '--', wind: '--', description: 'Nalaganje...', icon: 'thermostat'
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await DashboardService.getStats();
            setStats(data);
            
            if (data.locations && data.locations.length > 0) {
                const savedLoc = localStorage.getItem('preferredLocation');
                const defaultLoc = (savedLoc && data.locations.includes(savedLoc)) ? savedLoc : data.locations[0];
                setSelectedLocation(defaultLoc);
                fetchWeather(defaultLoc);
            } else {
                fetchWeather('Ljubljana');
            }
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationChange = (e) => {
        const newLoc = e.target.value;
        setSelectedLocation(newLoc);
        fetchWeather(newLoc);
    };

    const fetchWeather = async (locationName) => {
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();
            
            if (!geoData.results || geoData.results.length === 0) {
                setWeather({ temp: '--', humidity: '--', wind: '--', description: 'Lokacija ni najdena', icon: 'error' });
                return;
            }
            
            const { latitude, longitude } = geoData.results[0];
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
            const weatherData = await weatherRes.json();
            
            if (weatherData && weatherData.current) {
                const code = weatherData.current.weather_code;
                let desc = "Neznano"; let icon = "thermostat";
                
                if (code === 0) { desc = "Jasno"; icon = "light_mode"; }
                else if (code >= 1 && code <= 3) { desc = "Delno oblačno"; icon = "partly_cloudy_day"; }
                else if (code >= 45 && code <= 48) { desc = "Megla"; icon = "foggy"; }
                else if (code >= 51 && code <= 67) { desc = "Dež"; icon = "rainy"; }
                else if (code >= 71 && code <= 77) { desc = "Sneg"; icon = "snowing"; }
                else if (code >= 95) { desc = "Nevihta"; icon = "thunderstorm"; }

                setWeather({
                    temp: `${Math.round(weatherData.current.temperature_2m)}°C`,
                    humidity: `${weatherData.current.relative_humidity_2m}%`,
                    wind: `${weatherData.current.wind_speed_10m} km/h`,
                    description: desc, icon: icon
                });
            }
        } catch (error) {
            setWeather(prev => ({ ...prev, description: 'Napaka', icon: 'error' }));
        }
    };

    // Scroll to details when hive is selected
    const handleHiveSelect = (hive) => {
        // Toggle off if same hive clicked
        if (selectedHive && hive && selectedHive.id === hive.id) {
            setSelectedHive(null);
        } else {
            setSelectedHive(hive);
            // Update weather location to match selected hive
            if (hive.location) {
                setSelectedLocation(hive.location);
                fetchWeather(hive.location);
            }
        }
    };

    return (
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-l-4 border-primary flex items-start justify-between relative group overflow-hidden md:col-span-1">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Število panjev</p>
                        <div className="mt-2 flex items-baseline">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.activeHivesCount}</span>
                        </div>
                    </div>
                </Card>

                <Card className="border-l-4 border-blue-400 flex items-start justify-between relative group overflow-hidden md:col-span-1">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Opravila</p>
                        <div className="mt-2 flex items-baseline">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.upcomingTasks.length}</span>
                        </div>
                    </div>
                </Card>

                <Card className={`border-l-4 ${stats.warnings.length > 0 ? 'border-red-400' : 'border-green-400'} flex items-start justify-between relative group overflow-hidden md:col-span-1`}>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Opozorila</p>
                        <div className="mt-2 flex items-baseline">
                            <span className={`text-4xl font-bold ${stats.warnings.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{stats.warnings.length}</span>
                        </div>
                    </div>
                </Card>

                {/* Weather miniature */}
                <Card className="md:col-span-1 flex items-center justify-between p-4">
                    <div>
                        <select className="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer pb-1 mb-1" value={selectedLocation} onChange={handleLocationChange}>
                            {[...new Set([...stats.locations, selectedLocation])].map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
                        </select>
                        <h3 className="text-2xl font-bold">{weather.temp}</h3>
                    </div>
                    <span className="material-symbols-outlined text-4xl text-gray-700">{weather.icon}</span>
                </Card>
            </div>

            {/* Main Interactive Honeycomb Map */}
            <div className="mb-12">
                <div className="mb-4 text-center">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Vaš Čebelnjak</h2>
                    <p className="text-gray-500">Kliknite na panj za podroben pregled in upravljanje z opravili.</p>
                </div>
                
                <div className="bg-[#f8f8f5] dark:bg-[#1a1c23] rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-800 shadow-inner min-h-[400px]">
                    <HoneycombPanel 
                        selectedHive={selectedHive} 
                        onSelectHive={handleHiveSelect} 
                    />
                </div>
            </div>

            {/* Details Section (Scrolls here) */}
            <div ref={detailsRef} className="scroll-mt-6">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* Left Column: Health & Selected Details */}
                    <div className="xl:col-span-5 flex flex-col gap-8">
                        <HealthPanel 
                            selectedHive={selectedHive} 
                            onRecordAdded={() => {
                                // If we need to refetch global stats, we could trigger it here
                                fetchDashboardData();
                            }}
                        />
                    </div>

                    {/* Right Column: Tasks Board */}
                    <div className="xl:col-span-7">
                        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full">
                            <TasksPanel selectedHive={selectedHive} />
                        </div>
                    </div>

                </div>
            </div>

        </main>
    );
};

export default Dashboard;
