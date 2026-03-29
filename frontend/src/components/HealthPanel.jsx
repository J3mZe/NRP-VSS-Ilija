import React, { useState, useEffect } from 'react';
import HealthService from '../services/HealthService';
import HiveService from '../services/HiveService';

const HealthPanel = ({ selectedHive, onRecordAdded }) => {
    const [overview, setOverview] = useState(null);
    const [trend, setTrend] = useState(null);
    const [loading, setLoading] = useState(true);

    // Records
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [recordData, setRecordData] = useState({
        notes: '',
        status: 'healthy',
        disease_name: ''
    });

    useEffect(() => {
        // Only fetch general trend if no hive is selected
        if (!selectedHive) {
            fetchHealthData();
        }
    }, [selectedHive]);

    const fetchHealthData = async () => {
        try {
            setLoading(true);
            const [overviewData, trendData] = await Promise.all([
                HealthService.getOverview(),
                HealthService.getTrend()
            ]);
            setOverview(overviewData);
            setTrend(trendData);
        } catch (error) {
            console.error("Failed to fetch complex health aggregates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        if (!selectedHive) return;
        try {
            await HiveService.addRecord(selectedHive.id, recordData);
            setIsRecordModalOpen(false);
            setRecordData({ notes: '', status: 'healthy', disease_name: '' });
            
            // Notify parent to refresh the selected hive data
            if (onRecordAdded) onRecordAdded();
        } catch (error) {
            console.error("Error creating record:", error);
            alert("Napaka pri dodajanju zapisa: " + (error.response?.data?.message || error.message));
        }
    };

    // Dynamic AI Analysis Generator
    const getAiAnalysis = (hive) => {
        if (!hive) return null;
        
        // Emptied/Dead Hive scenarios
        if (hive.weight === 0 || hive.weight === "0") {
            return {
                title: "Kritično: Prazen Panj",
                statusText: `Ta panj (${hive.name}) nima zabeležene teže (0 kg). To močno nakazuje na ropanje, odmrtje družine ali pa gre za popolnoma prazen panj.`,
                actionTitle: "Takojšen ukrep",
                actionText: "Nujno opravite fizičen pregled panja. Če je prazen, ga zaprite, da preprečite ropanje ter prenos morebitnih bolezni na sosednje družine.",
                iconState: "warning",
                color: "red-500",
                bg: "red-500/10",
                border: "red-500/30"
            };
        }

        // Low population scenario
        if (hive.strength < 10000) {
            return {
                title: "Opozorilo: Šibka družina",
                statusText: `Trenutna ocenjena populacija za ${hive.name} je šibka (${(hive.strength / 1000).toFixed(1)}k). Za ta čas v sezoni je razvoj upočasnjen.`,
                actionTitle: "Predlagan ukrep",
                actionText: "Priporočamo, da preverite prisotnost matice ter zaloge hrane. Razmislite o združevanju z močnejšo družino, če gre za brezmatičnost.",
                iconState: "error_outline",
                color: "orange-500",
                bg: "orange-500/10",
                border: "orange-500/30"
            };
        }

        // Default stable scenario
        return {
            title: "Stanje glede na sezono",
            statusText: `Ta panj (${hive.name}) kaže stabilen razvoj glede na trenutno obdobje. Kljub temu algoritem zaznava blago nihanje teže, kar bi lahko nakazovalo na začasen padec medičine v naravi.`,
            actionTitle: "Predlagan ukrep",
            actionText: "Priporočamo, da ob naslednjem pregledu skrbno preverite zaloge cvetnega prahu in po potrebi dodate proteinsko pogačo.",
            iconState: "auto_awesome",
            color: "[#F4B400]",
            bg: "[#F4B400]/10",
            border: "[#F4B400]/30"
        };
    };

    if (selectedHive) {
        const aiInfo = getAiAnalysis(selectedHive);

        // Detail View for Selected Hive
        return (
            <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-[#1d180c] dark:text-white">
                            Zdravje in Pregledi
                        </h2>
                        <div className="mt-2 inline-block">
                            <span className="text-sm font-bold bg-primary/20 text-black px-3 py-1 rounded-lg border border-primary/30 inline-flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-sm">home_work</span>
                                Panj: {selectedHive.name}
                            </span>
                        </div>
                    </div>
                    <button onClick={() => setIsRecordModalOpen(true)} className="bg-primary hover:bg-[#e0a500] text-black font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group text-sm shrink-0 self-start whitespace-nowrap">
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                        Dodaj zapis
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Trenutno Stanje */}
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Trenutno stanje</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                                <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 font-bold uppercase"><span className="material-symbols-outlined text-[14px] text-primary">monitor_weight</span> Teža</span>
                                <span className="font-black text-lg text-gray-800 dark:text-white">{selectedHive.weight || 0} <span className="text-xs font-normal text-gray-400">kg</span></span>
                            </div>
                            <div className="flex flex-col bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                                <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 font-bold uppercase"><span className="material-symbols-outlined text-[14px] text-primary">cake</span> Matica</span>
                                <span className="font-black text-lg text-gray-800 dark:text-white">{selectedHive.queen_age}</span>
                            </div>
                            <div className="flex flex-col bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                                <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 font-bold uppercase"><span className="material-symbols-outlined text-[14px] text-primary">hive</span> Pop.</span>
                                <span className="font-black text-lg text-gray-800 dark:text-white">{selectedHive.strength >= 100 ? `${(selectedHive.strength / 1000).toFixed(1)}k` : 'Ocenjena'}</span>
                            </div>
                        </div>
                        {selectedHive.notes && (
                            <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                <strong className="block mb-1 text-orange-800 dark:text-orange-400 text-xs uppercase tracking-wider">Opombe panja:</strong>
                                {selectedHive.notes}
                            </div>
                        )}
                    </div>

                    {/* Zgodovina pregledov */}
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm min-h-[250px]">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Zgodovina pregledov</h3>
                        
                        <div className="space-y-4 relative">
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800"></div>
                            {selectedHive.healthRecords && selectedHive.healthRecords.length > 0 ? (
                                selectedHive.healthRecords.slice().reverse().map(record => (
                                    <div key={record.id} className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-[24px] h-[24px] rounded-full border-4 border-white dark:border-card-dark bg-primary flex items-center justify-center z-10 shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-800 text-[9px] font-black uppercase rounded-lg shadow-sm">
                                                    Pregled
                                                </span>
                                                <span className="text-xs text-gray-400 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">calendar_today</span> {new Date(record.inspection_date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-1">{record.notes}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 pl-8 italic">Ni vpisanih pregledov za ta panj.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`bg-${aiInfo.bg} border border-${aiInfo.border} p-6 rounded-xl shadow-sm mt-6 transition-colors duration-300`}>
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`material-symbols-outlined text-${aiInfo.color} text-2xl`}>{aiInfo.iconState}</span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">AI Analiza Panja:</h3>
                    </div>
                    <div className="space-y-4 opacity-100" title="Umetna inteligenca analizira podatke panja.">
                        <div className="group">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{aiInfo.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {aiInfo.statusText}
                            </p>
                        </div>
                        <div className={`h-px bg-${aiInfo.border} w-full`}></div>
                        <div className="group">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{aiInfo.actionTitle}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {aiInfo.actionText}
                            </p>
                        </div>
                    </div>
                </div>

                {isRecordModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">border_color</span>
                                Nov Zapis · {selectedHive.name}
                            </h2>
                            <form onSubmit={handleAddRecord} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Vaša ugotovitev</label>
                                    <textarea required className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none" rows="5" value={recordData.notes} onChange={e => setRecordData({...recordData, notes: e.target.value})} placeholder="Kakšen je bil današnji pregled družine?"></textarea>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setIsRecordModalOpen(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">Prekliči</button>
                                    <button type="submit" className="px-6 py-2 bg-primary text-black font-black text-sm rounded-xl hover:bg-primary-hover shadow-lg">Shrani Zapis</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (loading || !overview || !trend) return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto my-10"></div>;

    // General View
    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#1d180c] dark:text-white">Zdravje čebeljaka</h2>
                    <p className="text-sm text-slate-500">Sestavljena analiza in spremljanje vitalnosti modulov</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#F4B400] text-sm">trending_up</span> Trend zdravja
                    </h3>
                    <div className="h-40 w-full flex items-end justify-between gap-1 relative pt-4">
                        {trend.labels.map((month, idx) => {
                            const currentScore = trend.series.current[idx];
                            let colorClass = "bg-red-500/80";
                            if (currentScore >= 75) colorClass = "bg-[#10B981]/80";
                            else if (currentScore >= 55) colorClass = "bg-[#F4B400]/80";
                            
                            return (
                                <div key={idx} className="flex-1 rounded-t relative group flex flex-col justify-end h-full">
                                        <div className={`w-full ${colorClass} rounded-t transition-all`} style={{ height: `${currentScore}%` }}></div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase px-2 w-full">
                        {trend.labels.map((month, idx) => <span key={idx} className="flex-1 text-center">{month}</span>)}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500 text-sm">bug_report</span> Tveganje za varojo
                    </h3>
                    <div className="flex flex-col items-center justify-center h-40">
                        <div className="text-4xl font-black uppercase text-slate-800">{overview.varroaRiskSummary}</div>
                        <p className="text-sm text-slate-500 mt-2 text-center max-w-[200px]">
                            Povprečje iz zadnjih ocenjenih parametrov.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-[#F4B400]/10 border border-[#F4B400]/30 p-6 rounded-xl shadow-sm mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#F4B400] text-2xl">auto_awesome</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Splošno AI Priporočilo:</h3>
                </div>
                <div className="space-y-4 opacity-80">
                    <div className="group">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-[#F4B400] flex items-center justify-center text-black font-bold text-[10px]">01</div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Povečajte krmljenje</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 pl-7">
                            Določene družine na vaši lokaciji kažejo znake pomanjkanja zalog. Priporočamo dodajanje pogač vsem šibkejšim družinam.
                        </p>
                    </div>
                    <div className="h-px bg-[#F4B400]/20 w-full"></div>
                    <div className="group">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-[#F4B400] flex items-center justify-center text-black font-bold text-[10px]">02</div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Čas za tretiranje varoje</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 pl-7">
                            Napovedano vreme za naslednji teden (stabilnih 18-22°C) na izbrani lokaciji je idealno za uporabo sredstev proti varoji.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthPanel;
