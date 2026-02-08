import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';
import { useAuthStore } from '../../../store';
import AuthModal from '../../auth/components/AuthModal';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
/**
 * Home page component
 */
const HomePage = () => {
    const { t } = useTranslation();
    const { isAuthenticated, user, logout } = useAuthStore();
    const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

    const openAuthModal = (mode) => {
        setAuthModal({ isOpen: true, mode });
    };

    const closeAuthModal = () => {
        setAuthModal({ isOpen: false, mode: 'login' });
    };

    const handleLogout = () => {
        logout();
        toast.success(t('common.logoutSuccess'));
    };

    // Marquee content component for seamless loop
    const MarqueeContent = () => (
        <>
            <span className="flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {t('home.features.realtime')}
            </span>
            <span className="flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>
                {t('home.features.alerts')}
            </span>
            <span className="flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                {t('home.features.analysis')}
            </span>
            <span className="flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse"></span>
                {t('home.features.visualization')}
            </span>
            <span className="flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                {t('home.features.health')}
            </span>
        </>
    );

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <header className="px-8 py-4">
                <nav className="flex justify-between items-center max-w-[1200px] mx-auto">
                    <Link to="/" className="text-2xl font-bold font-mono text-primary hover:opacity-80 transition-opacity">
                        EnviroMonitor
                    </Link>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-3 px-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
                                        {(user?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-text-muted font-medium max-w-[120px] truncate hidden sm:block">
                                        {user?.name || 'User'}
                                    </span>
                                </div>
                                <Button variant="ghost" size="small" onClick={handleLogout}>
                                    {t('common.logout')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="text-text hover:text-primary transition-colors duration-150 font-medium"
                                >
                                    {t('common.login')}
                                </button>
                                <Button variant="primary" size="small" onClick={() => openAuthModal('register')}>
                                    {t('common.getStarted')}
                                </Button>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* Marquee Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-surface/30 via-surface/50 to-surface/30 backdrop-blur-sm py-4 border-y border-border/50 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
                <div className="flex gap-6 whitespace-nowrap animate-marquee text-sm font-medium opacity-85 tracking-[0.12em] text-text-secondary">
                    <MarqueeContent />
                    <MarqueeContent />
                    <MarqueeContent />
                    <MarqueeContent />
                </div>
            </div>

            <main className="max-w-[1200px] mx-auto px-8 py-16">
                <section className="text-center py-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-up animate-once animate-duration-2000">
                        {t('home.title1')}
                        <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {t('home.title2')}
                        </span>
                    </h1>
                    <p className="text-xl text-text-muted max-w-[600px] mx-auto mb-8 animate-fade-up animate-once animate-duration-1500">
                        {t('home.description')}
                    </p>
                    <div className="flex gap-4 justify-center flex-col sm:flex-row items-center animate-fade-up animate-once animate-duration-2000">
                        {isAuthenticated ? (
                        <Link to="/dashboard">
                            <Button variant="secondary" size="large" className="flex items-center gap-2">
                                {t('home.viewDemo')} <ArrowUpRight/>
                            </Button>
                        </Link>) : (<>
                            <Button variant="primary" size="large" onClick={() => openAuthModal('login')}>                                
                                {t('home.viewDemo')} <ArrowUpRight/>
                            </Button>
                        </>)}
                    </div>
                    <div className="fixed bottom-4 right-4 text-xs text-gray-400 opacity-70 tracking-wide select-none">
                        {t('home.copyright')}
                    </div>
                </section>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModal.isOpen}
                onClose={closeAuthModal}
                initialMode={authModal.mode}
            />
            </main>
        </div>
    );
};

export default HomePage;
