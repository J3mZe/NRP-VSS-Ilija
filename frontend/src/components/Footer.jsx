import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
    // Hide footer on specific pages like Dashboard where it wasn't present,
    // or show it universally depending on design rules. We'll return the universal footer.
    const location = useLocation();
    
    // Auth pages have a specific looking footer
    if (['/login', '/register'].includes(location.pathname)) {
        return (
            <footer className="w-full py-12 bg-background border-t border-stone-200">
                <div className="flex flex-col md:flex-row items-center justify-between px-8 max-w-7xl mx-auto gap-4">
                    <p className="text-xs text-stone-500 uppercase font-medium tracking-wider">
                        © 2024 MojČebelar. The Organic Ledger for Modern Apiaries.
                    </p>
                    <div className="flex gap-8">
                        <Link to="#" className="text-xs text-stone-500 hover:text-primary font-medium transition-all">Privacy Policy</Link>
                        <Link to="#" className="text-xs text-stone-500 hover:text-primary font-medium transition-all">Terms of Service</Link>
                        <Link to="#" className="text-xs text-stone-500 hover:text-primary font-medium transition-all">Bee Health Resources</Link>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <footer className="w-full py-8 mt-auto text-center text-xs text-gray-400 uppercase tracking-widest border-t border-gray-100">
            © 2024 MojČebelar • Trajnostno Čebelarstvo
        </footer>
    );
};

export default Footer;
