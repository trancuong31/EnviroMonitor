import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store';
import { Button } from '../../../components/ui';
import { X } from 'lucide-react';
import { toast } from 'sonner';
/**
 * Auth Modal Component - Login and Register
 */
const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { login, register, isLoading, error, clearError } = useAuthStore();
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    // Reset form when modal closes or mode changes
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            clearError();
        }
    }, [isOpen, clearError]);

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;
        
        if (mode === 'login') {
            result = await login(formData.email, formData.password);
        } else {
            result = await register(formData);
        }

        if (result.success) {
            onClose();
            navigate('/dashboard');
            toast.success(t(`auth.${mode}Success`));
        }
    };

    const toggleMode = () => {
        setMode((prev) => (prev === 'login' ? 'register' : 'login'));
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        clearError();
    };

    if (!isOpen) return null;

    const inputClasses =
        'w-full px-4 py-3 bg-surface-alt border border-border rounded-lg text-text text-base transition-colors duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-text-muted/70';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-fade-in"></div>

            {/* Modal */}
            <div
                className="relative w-full max-w-[440px] bg-surface rounded-2xl shadow-2xl border border-border animate-fade-up delay-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors duration-150"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold mb-2">
                            {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
                        </h2>
                        <p className="text-text-muted">
                            {mode === 'login' ? t('auth.signInDesc') : t('auth.createAccountDesc')}
                        </p>
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-error/10 text-error px-4 py-3 rounded-lg border border-error text-sm">
                                {error}
                            </div>
                        )}

                        {mode === 'register' && (
                            <div className="flex flex-col gap-2">
                                <label htmlFor="name" className="text-sm font-medium text-text-muted">
                                    {t('auth.fullName')}
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t('auth.enterName')}
                                    required
                                    className={inputClasses}
                                />
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
                                className={inputClasses}
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
                                placeholder={mode === 'login' ? t('auth.enterPassword') : t('auth.createPassword')}
                                required
                                minLength={mode === 'register' ? 8 : undefined}
                                className={inputClasses}
                            />
                        </div>

                        {mode === 'register' && (
                            <div className="flex flex-col gap-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-text-muted">
                                    {t('auth.confirmPassword')}
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder={t('auth.confirmPasswordPlaceholder')}
                                    required
                                    minLength={8}
                                    className={inputClasses}
                                />
                            </div>
                        )}

                        <Button type="submit" variant="primary" size="large" loading={isLoading} className="w-full mt-2">
                            {mode === 'login' ? t('auth.signIn') : t('auth.register')}
                        </Button>
                    </form>

                    <div className="text-center mt-6 text-text-secondary text-sm">
                        <p>
                            {mode === 'login' ? t('auth.noAccount') : t('auth.alreadyHaveAccount')}{' '}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-primary font-medium hover:underline"
                            >
                                {mode === 'login' ? t('auth.signUp') : t('common.login')}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
