import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Mail, Shield, Building2, Bell, Lock, Save, Loader2, Layers, Eye, EyeOff } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'sonner';

const ProfileModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [userData, setUserData] = useState(null);
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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
            setPasswordData({ password: '', confirmPassword: '' });
        }
    }, [isOpen, t]);

    const handleSavePassword = async () => {
        if (!passwordData.password) {
            toast.warning(t('profile.noChanges', 'No changes detected'));
            return;
        }


        if (passwordData.password !== passwordData.confirmPassword) {
            toast.error(t('profile.confirmPasswordMismatch', 'Passwords do not match'));
            return;
        }

        setSaving(true);
        try {
            await api.put('/auth/profile', {
                ...userData, // Send existing info
                password: passwordData.password
            });
            
            setPasswordData({ password: '', confirmPassword: '' });
            toast.success(t('profile.updatePasswordSuccess', 'Password updated successfully'));
            onClose();
        } catch (err) {
            console.error('Failed to update password:', err);
            toast.error(err.response?.data?.message || t('profile.updatePasswordError', 'Failed to update password'));
        } finally {
            setSaving(false);
        }
    };

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md"></div>

            {/* Modal */}
            <div 
                className="relative w-full max-w-[480px] bg-surface rounded-2xl shadow-2xl border border-border animate-fade-up pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative flex items-center justify-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold">{t('profile.title', 'User Profile')}</h2>
                    
                    <button
                        onClick={onClose}
                        className="absolute right-6 p-2.5 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[85vh] overflow-y-auto scrollbar-hide">
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
                        <div className="flex flex-col gap-4">
                            {/* Static Profile Info */}
                            <div className="flex items-center gap-4 mb-1">
                                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                                    {(userData.fullname || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold truncate" title={userData.fullname}>{userData.fullname}</h3>
                                    <p className="text-sm text-text-muted truncate" title={userData.userid}>{userData.userid}</p>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {/* Role, Factory, Department */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="flex items-center gap-2.5 p-2.5 bg-surface-alt/50 rounded-xl border border-border">
                                        <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 shrink-0">
                                            <Shield size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] text-text-muted font-bold uppercase">{t('profile.role', 'Role')}</p>
                                            <p className="text-[11px] font-semibold uppercase truncate capitalize">{userData.role || 'User'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 p-2.5 bg-surface-alt/50 rounded-xl border border-border">
                                        <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500 shrink-0">
                                            <Bell size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] text-text-muted font-bold uppercase">{t('admin.emailAlert', 'Alert')}</p>
                                            <p className="text-[11px] uppercase font-semibold truncate">
                                                {userData.emailAlert === "Yes" ? "On" : "Off"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="flex items-center gap-2.5 p-2.5 bg-surface-alt/50 rounded-xl border border-border">
                                        <div className="p-1.5 bg-green-500/10 rounded-lg text-green-500 shrink-0">
                                            <Building2 size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] text-text-muted font-bold uppercase">{t('profile.factory', 'Factory')}</p>
                                            <p className="text-[11px] font-semibold truncate">{userData.factory || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 p-2.5 bg-surface-alt/50 rounded-xl border border-border">
                                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500 shrink-0">
                                            <Layers size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] text-text-muted font-bold uppercase">{t('auth.department', 'Dept')}</p>
                                            <p className="text-[11px] font-semibold truncate">{userData.department || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Password Update Section */}
                            <div className="pt-5 border-t border-border">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <Lock size={15} className="text-primary" />
                                    <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                                        {t('profile.updatePassword', 'Change Password')}
                                    </h4>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="grid grid-cols-1 gap-2.5">
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder={t('profile.password', 'New Password')}
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <input
                                            type="password"
                                            placeholder={t('profile.confirmPassword', 'Confirm Password')}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSavePassword}
                                        disabled={saving}
                                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
                                    >
                                        {saving ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        {t('profile.updatePassword', 'Update Password')}
                                    </button>
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
