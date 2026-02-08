import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';

/**
 * Home page component
 */
const HomePage = () => {
    const { t } = useTranslation();

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
                    <div className="text-2xl font-bold text-primary">EnviroMonitor</div>
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="text-text">
                            {t('common.login')}
                        </Link>
                        <Link to="/register">
                            <Button variant="primary" size="small">
                                {t('common.getStarted')}
                            </Button>
                        </Link>
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
                        <Link to="/dashboard">
                            <Button variant="primary" size="large">
                                {t('home.startTrial')}
                            </Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button variant="secondary" size="large">
                                {t('home.viewDemo')}
                            </Button>
                        </Link>
                    </div>
                    <div className="fixed bottom-4 right-4 text-xs text-gray-400 opacity-70 tracking-wide select-none">
                        {t('home.copyright')}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomePage;
