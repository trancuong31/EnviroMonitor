import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';

/**
 * Home page component
 */
const HomePage = () => {
    const { t } = useTranslation();

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

            <main className="max-w-[1200px] mx-auto px-8 py-16">
                <section className="text-center py-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                        {t('home.title1')}
                        <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {t('home.title2')}
                        </span>
                    </h1>
                    <p className="text-xl text-text-muted max-w-[600px] mx-auto mb-8">
                        {t('home.description')}
                    </p>
                    <div className="flex gap-4 justify-center flex-col sm:flex-row items-center">
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
                </section>
            </main>
        </div>
    );
};

export default HomePage;
