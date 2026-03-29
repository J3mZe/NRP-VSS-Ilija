import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Register = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('beekeeper');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [terms, setTerms] = useState(false);
    
    const [error, setError] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPasswordMatchError(false);

        if (password !== confirmPassword) {
            setPasswordMatchError(true);
            return;
        }

        if (!terms) {
            setError('Strinjati se morate s pogoji poslovanja.');
            return;
        }

        setLoading(true);

        try {
            const response = await AuthService.register(username, email, password, role, firstName, lastName);

            // Bypassed email check screen, go directly to login
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registracija ni uspela');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-body bg-background text-on-background honeycomb-pattern min-h-screen flex flex-col">
            <style>{`
                .honeycomb-pattern {
                    background-color: #f8f8f5;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%23f5b400' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E");
                }
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
            `}</style>

            {/* TopNavBar Strategy: Transactional Screen - Hide Nav Links, Show Brand Only */}
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
                        <button className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-semibold active:scale-95 transition-transform hover:opacity-90">
                            Create Account
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow pt-24 pb-12 px-4 flex justify-center items-center">
                {/* Registration Card */}
                <div className="w-full max-w-[520px] bg-surface rounded-lg shadow-card overflow-hidden relative border-l-4 border-primary">
                    {/* Contextual Watermark for Organic Ledger Feel */}
                    <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[8rem] text-primary opacity-5 select-none pointer-events-none" data-icon="hive">hive</span>
                    
                    <div className="p-8 md:p-12 relative z-10">
                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-4xl">mark_email_unread</span>
                                </div>
                                <h1 className="text-3xl font-bold font-headline tracking-tight text-on-surface mb-4">Preverite vaš e-poštni predal</h1>
                                <p className="text-on-surface-variant text-base mb-8 leading-relaxed">
                                    Uspešno ste ustvarili račun. Na naslov <strong className="text-stone-800">{email}</strong> smo poslali aktivacijsko povezavo. 
                                    Za nadaljevanje in prijavo v sistem morate aktivirati svoj profil tako, da kliknete na prejeto povezavo.
                                </p>
                                <button onClick={() => navigate('/login')} className="w-full bg-surface-container-low border-2 border-primary text-black font-bold py-3.5 rounded-lg shadow-sm hover:bg-primary transition-all duration-200 font-headline uppercase tracking-widest">
                                    Nazaj na prijavo
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-10">
                                    <h1 className="text-3xl font-bold font-headline tracking-tight text-on-surface mb-2">Ustvari račun</h1>
                                    <p className="text-on-surface-variant text-base">Začni upravljati svoj čebelnjak</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    {/* Username */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-outline" htmlFor="username">Uporabniško ime</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors" data-icon="account_circle">account_circle</span>
                                            <input 
                                                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-transparent border-2 rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0 focus:border-primary focus:bg-white transition-all" 
                                                id="username" 
                                                name="username" 
                                                placeholder="npr. cebelica123" 
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* First Name & Last Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-outline" htmlFor="firstName">Ime</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors" data-icon="person">person</span>
                                                <input 
                                                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-transparent border-2 rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0 focus:border-primary focus:bg-white transition-all" 
                                                    id="firstName" 
                                                    name="firstName" 
                                                    placeholder="npr. Janez" 
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-outline" htmlFor="lastName">Priimek</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors" data-icon="person">person</span>
                                                <input 
                                                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-transparent border-2 rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0 focus:border-primary focus:bg-white transition-all" 
                                                    id="lastName" 
                                                    name="lastName" 
                                                    placeholder="npr. Novak" 
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-outline" htmlFor="email">E-poštni naslov</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors" data-icon="mail">mail</span>
                                            <input 
                                                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-transparent border-2 rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0 focus:border-primary focus:bg-white transition-all" 
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

                                    {/* Role Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-outline" htmlFor="role">Vloga</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none" data-icon="badge">badge</span>
                                            <select 
                                                className="w-full pl-12 pr-10 py-3.5 bg-surface-container-low border-transparent border-2 rounded-lg text-on-surface appearance-none focus:outline-none focus:ring-0 focus:border-primary focus:bg-white transition-all" 
                                                id="role" 
                                                name="role"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                            >
                                                <option value="beekeeper">Čebelar</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none" data-icon="expand_more">expand_more</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Password */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-outline" htmlFor="password">Geslo</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl" data-icon="lock">lock</span>
                                                <input 
                                                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-primary border-2 rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0 focus:bg-white transition-all" 
                                                    id="password" 
                                                    name="password" 
                                                    placeholder="••••••••" 
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <p className="text-[11px] text-on-secondary-fixed-variant font-medium mt-1">Ustrezno geslo</p>
                                        </div>
                                        
                                        {/* Confirm Password */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-outline" htmlFor="confirm-password">Potrdi geslo</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl" data-icon="lock_reset">lock_reset</span>
                                                <input 
                                                    className={`w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-2 rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0 focus:bg-white transition-all ${
                                                        passwordMatchError ? 'border-error focus:border-error' : 'border-transparent focus:border-primary'
                                                    }`}
                                                    id="confirm-password" 
                                                    name="confirm-password" 
                                                    placeholder="••••••••" 
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => {
                                                        setConfirmPassword(e.target.value);
                                                        if (passwordMatchError && e.target.value === password) {
                                                            setPasswordMatchError(false);
                                                        }
                                                    }}
                                                    required
                                                />
                                            </div>
                                            {passwordMatchError && (
                                                <p className="text-[11px] text-on-error-container font-medium mt-1">Gesli se ne ujemata</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Terms checkbox */}
                                    <div className="flex items-start gap-3 pt-2">
                                        <div className="flex items-center h-5">
                                            <input 
                                                className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary focus:ring-offset-0" 
                                                id="terms" 
                                                type="checkbox"
                                                checked={terms}
                                                onChange={(e) => setTerms(e.target.checked)}
                                            />
                                        </div>
                                        <label className="text-xs text-on-surface-variant leading-relaxed" htmlFor="terms">
                                            Strinjam se s <a className="text-primary font-bold hover:underline" href="#">pogoji poslovanja</a> in pravili zasebnosti aplikacije MojČebelar.
                                        </label>
                                    </div>

                                    {/* CTA */}
                                    <div className="pt-6">
                                        <button 
                                            className="w-full bg-primary text-on-primary font-black py-4 rounded-lg shadow-md hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-200 font-headline uppercase tracking-widest disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed" 
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Registriranje...' : 'Registracija'}
                                        </button>
                                    </div>
                                    
                                    <div className="text-center pt-2">
                                        <p className="text-sm text-on-surface-variant">
                                            Že imaš račun? 
                                            <a className="text-primary font-bold hover:underline transition-all ml-1" href="/login">Prijava</a>
                                        </p>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>
            
            <footer className="w-full py-8 text-center text-[10px] text-outline uppercase tracking-[0.3em]">
                © 2024 MojČebelar Organic Ledger • Trajnostno Čebelarstvo
            </footer>
        </div>
    );
};

export default Register;
