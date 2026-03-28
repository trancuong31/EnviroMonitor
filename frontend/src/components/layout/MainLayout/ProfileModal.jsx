import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Mail, Shield, Building2 } from 'lucide-react';
import api from '../../../services/api';

const ProfileModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setError(null);
            api.get('/auth/me')
                .then((res) => {
                    const data = res.data?.data?.user || res.data?.data || res.data?.user || res.data;
                    setUserData(data);
                })
                .catch((err) => {
                    console.error('Failed to load profile:', err);
                    setError(t('dashboard.error') || 'Failed to load profile');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setUserData(null);
        }
    }, [isOpen, t]);

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

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md"></div>

            {/* Modal */}
            <div 
                className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-border animate-fade-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative flex items-center justify-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold">{t('profile.title', 'User Profile')}</h2>
                    
                    <button
                        onClick={onClose}
                        className="absolute right-6 p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center flex-col items-center py-8">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-text-muted">{t('dashboard.loading', 'Loading data...')}</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-error py-8 px-4 bg-error/10 rounded-lg border border-error/20">
                            <p>{error}</p>
                        </div>
                    ) : userData ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                                    {(userData.fullname || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-semibold truncate" title={userData.fullname}>{userData.fullname}</h3>
                                    <p className="text-sm text-text-muted truncate" title={userData.userid}>{userData.userid}</p>
                                </div>
                            </div>

                            <div className="grid gap-3 mt-2">
                                <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-xl border border-border transition-colors hover:border-primary/30">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                                        <User size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-text-muted font-medium mb-0.5">{t('profile.name', 'Name')}</p>
                                        <p className="text-sm font-semibold truncate" title={userData.fullname}>{userData.fullname}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-xl border border-border transition-colors hover:border-secondary/30">
                                    <div className="p-2 bg-secondary/10 rounded-lg text-secondary shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-text-muted font-medium mb-0.5">{t('profile.email', 'Email')}</p>
                                        <p className="text-sm font-semibold truncate" title={userData.userid}>{userData.userid}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-xl border border-border transition-colors hover:border-amber-500/30">
                                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 shrink-0">
                                        <Shield size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-text-muted font-medium mb-0.5">{t('profile.role', 'Role')}</p>
                                        <p className="text-sm font-semibold capitalize truncate" title={userData.role || 'User'}>{userData.role || 'User'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-xl border border-border transition-colors hover:border-green-500/30">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500 shrink-0">
                                        <Building2 size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-text-muted font-medium mb-0.5">{t('profile.factory', 'Factory')}</p>
                                        <p className="text-sm font-semibold truncate" title={userData.factory || 'Unknown'}>{userData.factory || 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
