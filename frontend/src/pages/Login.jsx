import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isVerified = searchParams.get('verified') === 'true';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await AuthService.login(email, password);

            // Save accessToken in localStorage
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
            }
            // Save user role in localStorage (backend returns 'roles')
            if (data.roles) {
                localStorage.setItem('role', data.roles);
            }

            // Redirect to dashboard on success
            navigate('/');
            
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Prijava ni uspela');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-body bg-background text-on-background min-h-screen flex flex-col honeycomb-pattern">
            <style>{`
                .honeycomb-pattern {
                    background-color: #f8f8f5;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%23f5b400' stroke-opacity='0.05' stroke-width='1.5'/%3E%3C/svg%3E");
                }
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
            `}</style>
            
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-xl font-bold text-stone-900 tracking-tighter flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>hive</span>
                        MojČebelar
                    </div>
                    <nav className="hidden md:flex items-center gap-8 font-medium text-sm tracking-tight">
                        <a className="text-stone-600 hover:text-primary transition-colors duration-200" href="#">Features</a>
                        <a className="text-stone-600 hover:text-primary transition-colors duration-200" href="#">Sustainability</a>
                        <a className="text-stone-600 hover:text-primary transition-colors duration-200" href="#">About</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to="/register" className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-semibold active:scale-95 transition-transform hover:opacity-90">
                            Create Account
                        </Link>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow flex items-center justify-center px-4 py-24">
                <div className="w-full max-w-[440px] flex flex-col gap-8">
                    {/* Login Card */}
                    <div className="bg-surface rounded-lg shadow-card p-10 relative overflow-hidden border border-stone-100">
                        {/* Watermark Icon */}
                        <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none transform rotate-12">
                            <span className="material-symbols-outlined text-[180px]">token</span>
                        </div>
                        <div className="relative z-10">
                            <div className="mb-10">
                                <h1 className="text-[28px] font-bold text-on-surface tracking-tight mb-2">Prijava v MojČebelar</h1>
                                <p className="text-on-surface-variant text-base">Dobrodošli nazaj</p>
                            </div>
                            
                            {isVerified && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-bold flex items-center gap-3 shadow-sm">
                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                    MojČebelar račun je uspešno aktiviran! Sedaj se lahko prijavite.
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline ml-1" htmlFor="email">E-poštni naslov</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">mail</span>
                                        <input 
                                            className="w-full h-12 pl-12 pr-4 bg-white border border-outline-variant rounded-lg text-on-surface placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                                            id="email" 
                                            name="email" 
                                            placeholder="vas@email.com" 
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline" htmlFor="password">Geslo</label>
                                        <a className="text-xs font-semibold text-secondary hover:text-primary transition-colors" href="#">Pozabljeno geslo?</a>
                                    </div>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">lock</span>
                                        <input 
                                            className="w-full h-12 pl-12 pr-4 bg-white border border-outline-variant rounded-lg text-on-surface placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                                            id="password" 
                                            name="password" 
                                            placeholder="••••••••" 
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pb-2 ml-1">
                                    <input 
                                        className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary focus:ring-offset-0 cursor-pointer" 
                                        id="remember" 
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label className="text-sm text-on-surface-variant font-medium cursor-pointer" htmlFor="remember">Zapomni si me na tej napravi</label>
                                </div>
                                <button 
                                    className="w-full h-12 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base disabled:opacity-70 disabled:cursor-not-allowed" 
                                    type="submit"
                                    disabled={loading}
                                >
                                    <span>{loading ? 'Prijavljanje...' : 'Prijava'}</span>
                                    <span className="material-symbols-outlined text-xl">login</span>
                                </button>
                            </form>
                        </div>
                    </div>
                    {/* Bottom Link */}
                    <div className="text-center">
                        <p className="text-on-surface-variant text-sm font-medium">
                            Nimate računa? 
                            <Link className="font-bold text-on-surface hover:text-primary transition-colors ml-1" to="/register">Registracija</Link>
                        </p>
                    </div>
                </div>
            </main>
            
            {/* Footer */}
            <footer className="w-full py-12 bg-background border-t border-stone-200">
                <div className="flex flex-col md:flex-row items-center justify-between px-8 max-w-7xl mx-auto gap-4">
                    <p className="text-xs text-stone-500 uppercase font-medium tracking-wider">
                        © 2024 MojČebelar. The Organic Ledger for Modern Apiaries.
                    </p>
                    <div className="flex gap-8">
                        <a className="text-xs text-stone-500 hover:text-primary font-medium transition-all" href="#">Privacy Policy</a>
                        <a className="text-xs text-stone-500 hover:text-primary font-medium transition-all" href="#">Terms of Service</a>
                        <a className="text-xs text-stone-500 hover:text-primary font-medium transition-all" href="#">Bee Health Resources</a>
                    </div>
                </div>
            </footer>
            
            {/* AI Agent FAB */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform group" style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}>
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </button>
        </div>
    );
};

export default Login;
