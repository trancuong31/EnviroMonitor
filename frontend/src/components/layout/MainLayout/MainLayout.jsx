import { useState, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useThemeStore } from '../../../store';
import { Button, LanguageSwitcher } from '../../ui';
import ProfileModal from './ProfileModal';


/**
 * Main layout component with sticky header and scroll-to-top button
 */
const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const { t } = useTranslation();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }, []);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleScroll = useCallback(() => {
        setShowScrollTop(window.scrollY > 300);
    }, []);

    const handleProfile = () => {
        setShowProfileModal(true);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-1 bg-surface/80 backdrop-blur-xl border-b border-border shadow-sm transition-colors duration-300">
                <Link to="/" className="text-xl font-bold font-mono bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    {t('dashboard.title')}
                </Link>
                <nav className="flex items-center gap-3">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all duration-300"
                        aria-label="Toggle theme"
                        title={theme === 'light' ? t('theme.switchDark') : t('theme.switchLight')}
                    >
                        {theme === 'light' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        )}
                    </button>

                    <div className="w-px h-5 bg-border" />

                    {/* Language switcher */}
                    <LanguageSwitcher />

                    <div className="w-px h-5 bg-border" />

                    {isAuthenticated ? (
                        <>
                            <div className="hidden sm:flex items-center gap-2 text-sm text-text-muted">
                                {user?.role === 'Admin' && (
                                    <Link to="/admin/users" className="relative group flex items-center h-full pt-1 pb-1">
                                        <Button 
                                            variant="ghost" 
                                            size="small" 
                                            className={`text-primary transition-colors hover:bg-transparent ${
                                                location.pathname.startsWith('/admin/users') ? 'bg-primary/10 font-semibold' : ''
                                            }`}
                                        >
                                            {t('admin.userManagement', 'Users')}
                                        </Button>
                                        <span className={`absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full transition-transform duration-300 origin-center  ${
                                            location.pathname.startsWith('/admin/users') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                        }`} />
                                    </Link>
                                )}
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary flex items-center justify-center text-xs font-bold text-white ml-2">
                                    {(user?.fullname || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="relative group flex items-center h-full pt-1 pb-1">
                                    <Button 
                                        variant="ghost" 
                                        size="small" 
                                        onClick={handleProfile}
                                        className="text-primary transition-colors hover:bg-transparent"
                                    >
                                    {user?.fullname || 'User'}
                                </Button>
                                {/* Thanh gạch chân animation */}
                                <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full transition-transform duration-300 origin-center scale-x-0 group-hover:scale-x-100" />
                            </div>
                            </div>
                            <div className="relative group flex items-center h-full pt-1 pb-1">
                                <Button 
                                    variant="ghost" 
                                    size="small" 
                                    onClick={handleLogout} 
                                    className="text-primary transition-colors hover:bg-transparent"
                                >
                                    {t('common.logout')}
                                </Button>
                                {/* Thanh gạch chân animation */}
                                <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full transition-transform duration-300 origin-center scale-x-0 group-hover:scale-x-100" />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost" size="small">{t('common.login')}</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="primary" size="small">{t('common.register')}</Button>
                            </Link>
                        </>
                    )}
                </nav>
            </header>
            <div className="flex flex-1">
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>

            {/* Scroll to top button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-primary text-white shadow-[0_4px_16px_rgba(79,106,240,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_24px_rgba(79,106,240,0.5)] ${
                    showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                aria-label="Scroll to top"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
            </button>

            {/* Fullscreen toggle button*/}
            <button
                onClick={toggleFullscreen}
                className="fixed bottom-5 left-5 z-10 w-9 h-9 rounded-full bg-surface border border-border text-text-muted shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-primary hover:border-primary/30 hover:shadow-lg"
                aria-label="Toggle fullscreen"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </div>
    );
};

export default MainLayout;
