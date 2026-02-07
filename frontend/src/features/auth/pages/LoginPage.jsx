import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store';
import { Button } from '../../../components/ui';

/**
 * Login page component
 */
const LoginPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { login, isLoading, error, clearError } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData.email, formData.password);
        if (result.success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300 p-8">
            <div className="w-full max-w-[420px]">
                <div className="bg-surface rounded-xl p-10 shadow-lg border border-border transition-colors duration-300">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">{t('auth.welcomeBack')}</h1>
                        <p className="text-text-muted">{t('auth.signInDesc')}</p>
                    </div>

                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-error/10 text-error px-4 py-3 rounded-lg border border-error text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-text-muted">
                                {t('auth.email')}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t('auth.enterEmail')}
                                required
                                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-lg text-text text-base transition-colors duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-text-muted/70"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-sm font-medium text-text-muted">
                                {t('auth.password')}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t('auth.enterPassword')}
                                required
                                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-lg text-text text-base transition-colors duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-text-muted/70"
                            />
                        </div>

                        <Button type="submit" variant="primary" size="large" loading={isLoading} className="w-full mt-2">
                            {t('auth.signIn')}
                        </Button>
                    </form>

                    <div className="text-center mt-6 text-text-muted">
                        <p>
                            {t('auth.noAccount')}{' '}
                            <Link to="/register" className="text-primary font-medium">
                                {t('auth.signUp')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
