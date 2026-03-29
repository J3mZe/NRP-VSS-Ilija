import React, { useState, useEffect } from 'react';
import ReportService from '../services/ReportService';

const Reports = () => {
    // Inject the Chrome/Edge precise graphics override natively instructing the PDF raster to capture background color layers actively.
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const [activeTab, setActiveTab] = useState('annual');
    const [loading, setLoading] = useState(true);
    const [annualData, setAnnualData] = useState(null);
    const [healthData, setHealthData] = useState(null);
    const [reservesData, setReservesData] = useState(null);
    const [trendData, setTrendData] = useState({});

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const [ann, hlth, res_overview] = await Promise.all([
                    ReportService.getAnnualReport(),
                    ReportService.getHealthReport(),
                    ReportService.getHoneyReservesOverview()
                ]);
                setAnnualData(ann);
                setHealthData(hlth);
                setReservesData(res_overview);

                // Asynchronous sequential fetching for deep historical graphs so main payload doesn't block DOM
                if (res_overview && res_overview.length > 0) {
                    const trends = {};
                    for (let hive of res_overview) {
                        const trend = await ReportService.getHoneyReservesTrend(hive.hiveId);
                        trends[hive.hiveId] = trend;
                    }
                    setTrendData(trends);
                }

            } catch (error) {
                console.error("Failed to fetch formal report logic", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const renderAnnualReport = () => {
        if (!annualData) return null;
        
        let maxYield = Math.max(...annualData.monthlyYields.data, 1);
        
        return (
            <div className="max-w-[800px] mx-auto bg-white dark:bg-slate-900 shadow-2xl print:shadow-none p-12 min-h-[800px] flex flex-col gap-8 print:w-full print:max-w-none print:p-0">
                <div className="flex justify-between items-start border-b-4 border-primary pb-6">
                    <div>
                        <h5 className="text-3xl font-black uppercase text-black dark:text-white">Letno Poročilo {annualData.year}</h5>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">MojČebelar Digitalna Evidenca</p>
                    </div>
                    <div className="text-right text-sm text-slate-800 dark:text-slate-200">
                        <p className="font-bold">Generirano: <span className="font-normal">{new Date().toLocaleDateString('sl-SI')}</span></p>
                        <p className="font-bold">Uradni dokument</p>
                    </div>
                </div>

                <div>
                    <h6 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Mesečni donos medu (kg)
                    </h6>
                    <div className="w-full h-56 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-end justify-center gap-8 px-6 pb-2 pt-8 relative">
                        {annualData.monthlyYields.data.map((val, idx) => {
                            const heightPrc = maxYield > 0 ? (val / maxYield) * 95 : 0;
                            return (
                                <div key={idx} className="flex-1 max-w-[48px] bg-primary/70 rounded-t relative group" style={{ height: `${Math.max(heightPrc, 5)}%` }}>
                                    <div className="absolute -top-6 left-0 right-0 text-center text-xs font-bold text-slate-800 dark:text-slate-200">{val}</div>
                                </div>
                            )
                        })}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300 dark:bg-slate-600 print:bg-black"></div>
                    </div>
                    <div className="flex justify-center gap-8 px-6 mt-2 text-[10px] font-bold text-gray-400 print:text-black uppercase tracking-widest">
                        {annualData.monthlyYields.labels.map((m, idx) => <span key={idx} className="flex-1 max-w-[48px] text-center">{m}</span>)}
                    </div>
                </div>

                <div className="space-y-4">
                    <h6 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Povzetek sezone
                    </h6>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {annualData.summary}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 mt-4">
                        <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-lg border-l-4 border-primary">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Skupno število panjev</p>
                            <p className="text-3xl font-black text-black dark:text-white">{annualData.totalHives}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-lg border-l-4 border-primary">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Povprečje na panj</p>
                            <p className="text-3xl font-black text-black dark:text-white">{annualData.averageYield} kg</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-auto pt-8 border-t border-gray-100 dark:border-slate-800 print:border-black flex justify-between items-center italic text-gray-400 print:text-gray-600 text-xs">
                    <span>Poročilo generirano avtomatsko preko sistema MojČebelar</span>
                    <span>Stran 1 od 1</span>
                </div>
            </div>
        );
    };

    const renderHealthReport = () => {
        if (!healthData) return null;
        
        return (
            <div className="max-w-[800px] mx-auto bg-white dark:bg-slate-900 shadow-2xl print:shadow-none p-12 min-h-[800px] flex flex-col gap-8 print:w-full print:max-w-none print:p-0">
                <div className="flex justify-between items-start border-b-4 border-primary pb-6">
                    <div>
                        <h5 className="text-3xl font-black uppercase text-black dark:text-white">Zdravstvena Zgodovina {healthData.year}</h5>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Uradni veterinarski prerez celotne flote</p>
                    </div>
                    <div className="text-right text-sm text-slate-800 dark:text-slate-200">
                        <p className="font-bold">Generirano: <span className="font-normal">{new Date().toLocaleDateString('sl-SI')}</span></p>
                        <p className="font-bold">Veljavnost: <span className="font-normal text-green-600">Uradno veljavno</span></p>
                    </div>
                </div>

                <div className="w-full">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-100 dark:bg-slate-800 border-b-2 border-primary">
                            <tr>
                                <th className="p-3 font-bold text-gray-900 dark:text-gray-100">Datum</th>
                                <th className="p-3 font-bold text-gray-900 dark:text-gray-100">Panj</th>
                                <th className="p-3 font-bold text-gray-900 dark:text-gray-100">Status</th>
                                <th className="p-3 font-bold text-gray-900 dark:text-gray-100">Diagnoza in Beležke</th>
                            </tr>
                        </thead>
                        <tbody>
                            {healthData.records && healthData.records.length > 0 ? (
                                healthData.records.map((rec, i) => (
                                    <tr key={i} className="border-b border-gray-100 dark:border-slate-800">
                                        <td className="p-3 whitespace-nowrap">{new Date(rec.date).toLocaleDateString('sl-SI')}</td>
                                        <td className="p-3 font-bold text-black dark:text-white">{rec.hiveName}</td>
                                        <td className="p-3 uppercase text-[10px] font-bold">
                                            <span className={`px-2 py-1 rounded-full ${rec.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {rec.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-black dark:text-white">{rec.disease || 'Ni posebnosti'}</div>
                                            <div className="text-xs text-gray-500 mt-1">{rec.notes}</div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400 print:text-black italic">
                                        V sistemu še ni zabeleženih zdravstvenih pregledov...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto pt-8 border-t border-gray-100 dark:border-slate-800 print:border-black flex justify-between items-center italic text-gray-400 print:text-gray-600 text-xs">
                    <span>Poročilo generirano avtomatsko preko sistema MojČebelar</span>
                    <span>Stran 1 od 1</span>
                </div>
            </div>
        );
    };

    const renderReservesReport = () => {
        if (!reservesData || reservesData.length === 0) return (
            <div className="p-8 text-center text-gray-500 italic mt-12">Zahtevani podatki niso na voljo. Panji morajo biti kreirani v podatkovni bazi za zagon analitike.</div>
        );
    
        return (
            <div className="max-w-[800px] mx-auto bg-white dark:bg-slate-900 shadow-2xl print:shadow-none p-12 min-h-[800px] flex flex-col gap-8 print:w-full print:max-w-none print:p-0">
                <div className="flex justify-between items-start border-b-4 border-primary pb-6">
                    <div>
                        <h5 className="text-3xl font-black uppercase text-black dark:text-white">Poročilo o Zalogah Hrane</h5>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Uradni nadzor nad ocenjeno porabo in preživetjem flot</p>
                    </div>
                    <div className="text-right text-sm text-slate-800 dark:text-slate-200">
                        <p className="font-bold">Generirano: <span className="font-normal">{new Date().toLocaleDateString('sl-SI')}</span></p>
                    </div>
                </div>
    
                {reservesData.map(hive => {
                    const trends = trendData[hive.hiveId] || [];
                    const maxGram = trends.length > 0 ? Math.max(...trends.map(t => t.reserveEndGrams), 1) : 10000;
                    
                    return (
                        <div key={hive.hiveId} className="mb-4 border border-gray-100 dark:border-slate-800 rounded-xl p-6 print:break-inside-avoid shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-850">
                            <div className="flex justify-between items-center mb-6">
                                <h6 className="text-xl font-black text-slate-900 dark:text-white hover:text-primary transition-colors">{hive.hiveName}</h6>
                                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${hive.status === 'Kritično' ? 'bg-red-100 text-red-700 border-red-200' : (hive.status === 'Pozor' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-100 text-green-700 border-green-200')}`}>
                                    Stanje: {hive.status}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ocena Zalog (Cilj: 20kg)</p>
                                    <p className="text-xl font-black text-black dark:text-white">{(hive.currentReserveGrams / 1000).toFixed(1)} kg</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Manko (Shortfall)</p>
                                    <p className={`text-xl font-black ${hive.shortfallGrams > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                                        {hive.shortfallGrams > 0 ? `-${(hive.shortfallGrams / 1000).toFixed(1)} kg` : 'Ni manka'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg items-center">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">science</span> Potreben Sladkor (2:1)
                                    </p>
                                    <p className={`text-xl font-black ${hive.sugarNeededGrams > 0 ? 'text-red-600' : 'text-slate-300 dark:text-slate-600'}`}>
                                        {hive.sugarNeededGrams > 0 ? `${(hive.sugarNeededGrams / 1000).toFixed(1)} kg` : '0.0 kg'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Zaloga zadostuje za</p>
                                    <p className="text-xl font-black text-black dark:text-white">{hive.daysUntilCritical >= 999 ? 'Zimo' : `${hive.daysUntilCritical} dni`}</p>
                                </div>
                            </div>
    
                            {/* Visual Trend Chart */}
                            {trends.length > 0 && (
                                <div className="mt-4 border-t border-gray-100 dark:border-slate-800 pt-4">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-4">Trend zalog hrane (Zadnjih {Math.max(30, trends.length)} dni)</p>
                                    <div className="h-20 w-full flex items-end gap-1">
                                        {/* Inject transparent placeholder UI scaffolding mapping days before physical Panj creation preserving exact scale width */}
                                        {trends.length < 30 && [...Array(30 - trends.length)].map((_, i) => (
                                            <div key={`empty-${i}`} className="flex-1 h-full border-b-2 border-dashed border-gray-200 dark:border-slate-700 opacity-40"></div>
                                        ))}
                                        {trends.map((day, i) => {
                                            const hPrc = maxGram > 0 ? (day.reserveEndGrams / maxGram) * 100 : 0;
                                            return (
                                                <div key={i} className="flex-1 bg-primary/40 hover:bg-primary transition-colors rounded-t group relative" style={{ height: `${Math.max(2, hPrc)}%` }}>
                                                    {/* Tooltip block strictly hidden during pdf generation */}
                                                    <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded z-10 pointer-events-none whitespace-nowrap print:hidden">
                                                        {(day.reserveEndGrams/1000).toFixed(1)}kg ({day.reserveGainGrams - day.reserveLossGrams > 0 ? '+' : ''}{day.reserveGainGrams - day.reserveLossGrams}g)
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
                
                <div className="mt-auto pt-8 border-t border-gray-100 dark:border-slate-800 print:border-black flex justify-between items-center italic text-gray-400 print:text-gray-600 text-xs">
                    <span>Poročilo generirano avtomatsko preko sistema MojČebelar</span>
                    <span>Stran 1 od 1</span>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <main className="max-w-[1280px] mx-auto px-6 py-20 w-full flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </main>
        );
    }

    return (
        <main className="max-w-[1280px] mx-auto px-6 py-8 w-full print:p-0 print:m-0 print:max-w-none">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#1d180c] dark:text-white">Poročila</h2>
                    <p className="text-[#a18845] mt-1">Upravljanje in pregled čebelarskih poročil in analitike virov</p>
                </div>
                <button 
                    onClick={handlePrint}
                    className="bg-primary hover:bg-[#e0a500] text-black px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md"
                >
                    <span className="material-symbols-outlined">print</span>
                    Hitri Izvoz
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
                
                {/* Left Navigator Menu */}
                <div className="lg:col-span-4 space-y-4 print:hidden">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#a18845] px-1">Kategorije poročil</h3>
                    
                    <button 
                        onClick={() => setActiveTab('annual')}
                        className={`w-full text-left p-5 rounded-lg border-2 transition-all group ${activeTab === 'annual' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50'}`}
                    >
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${activeTab === 'annual' ? 'bg-primary' : 'bg-gray-100 dark:bg-slate-700 group-hover:bg-primary/20'}`}>
                                <span className={`material-symbols-outlined text-2xl ${activeTab === 'annual' ? 'text-black' : 'text-[#1d180c] dark:text-white'}`}>monitoring</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-[#1d180c] dark:text-white">Letno poročilo</h4>
                                <p className="text-sm text-[#a18845] leading-relaxed mt-1">Pregled donosa medu in aktivnosti za tekoče leto.</p>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setActiveTab('reserves')}
                        className={`w-full text-left p-5 rounded-lg border-2 transition-all group ${activeTab === 'reserves' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50'}`}
                    >
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${activeTab === 'reserves' ? 'bg-primary' : 'bg-gray-100 dark:bg-slate-700 group-hover:bg-primary/20'}`}>
                                <span className={`material-symbols-outlined text-2xl ${activeTab === 'reserves' ? 'text-black' : 'text-[#1d180c] dark:text-white'}`}>inventory_2</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-[#1d180c] dark:text-white">Zaloge hrane</h4>
                                <p className="text-sm text-[#a18845] leading-relaxed mt-1">Nadzor nad hrano in opozorila pred stradanjem.</p>
                            </div>
                        </div>
                    </button>
                    
                    <button 
                         onClick={() => setActiveTab('health')}
                         className={`w-full text-left p-5 rounded-lg border-2 transition-all group ${activeTab === 'health' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50'}`}
                    >
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${activeTab === 'health' ? 'bg-primary' : 'bg-gray-100 dark:bg-slate-700 group-hover:bg-primary/20'}`}>
                                <span className={`material-symbols-outlined text-2xl ${activeTab === 'health' ? 'text-black' : 'text-[#1d180c] dark:text-white'}`}>medical_services</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-[#1d180c] dark:text-white">Zdravstvena zgodovina</h4>
                                <p className="text-sm text-[#a18845] leading-relaxed mt-1">Podrobna evidenca zdravljenj in pregledov čebel.</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Document Injection Target Sandbox */}
                <div className="lg:col-span-8 print:col-span-12 print:w-full print:block">
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-xl print:shadow-none print:border-none overflow-hidden flex flex-col print:overflow-visible">
                        
                        <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between print:hidden">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400">visibility</span>
                                <span className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-tight">Pregled dokumenta</span>
                            </div>
                            <div className="px-3 py-1 bg-primary/10 text-primary uppercase text-[10px] font-black tracking-widest rounded">A4 Format</div>
                        </div>

                        {/* Sandbox Injection point masking overflowing edges so it looks like a real paper strictly rendering the activeTab block */}
                        <div className="flex-grow p-10 overflow-y-auto bg-gray-100 dark:bg-slate-950 print:bg-white print:p-0 print:overflow-visible">
                            {activeTab === 'annual' && renderAnnualReport()}
                            {activeTab === 'reserves' && renderReservesReport()}
                            {activeTab === 'health' && renderHealthReport()}
                        </div>

                        <div className="px-8 py-6 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end gap-4 print:hidden">
                            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-gray-200 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-400 font-bold transition-all text-gray-700 dark:text-gray-200">
                                <span className="material-symbols-outlined text-lg">print</span>
                                Natisni
                            </button>
                            <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary hover:bg-[#e0a500] text-black font-bold transition-all shadow-lg hover:shadow-primary/30">
                                <span className="material-symbols-outlined text-lg">download</span>
                                Prenesi PDF
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
};

export default Reports;
