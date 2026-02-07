import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';

/**
 * 404 Not Found page
 */
const NotFoundPage = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <h1 className="text-[8rem] font-extrabold leading-none mb-4 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    404
                </h1>
                <p className="text-xl text-text-muted mb-8">
                    {t('notFound.message')}
                </p>
                <Link to="/">
                    <Button variant="primary" size="large">
                        {t('common.goHome')}
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
