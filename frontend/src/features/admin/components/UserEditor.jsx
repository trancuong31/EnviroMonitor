import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Save, 
    AlertCircle, 
    User, 
    Mail, 
    Lock, 
    Shield, 
    Activity, 
    Factory as FactoryIcon 
} from 'lucide-react';
import { Button, CustomSelect, CustomCheckbox } from '../../../components/ui';

const UserEditor = ({ user, onSave, onCancel, roles = [], factories = [] }) => {
    const { t } = useTranslation();
    const isEditing = !!user?.id;
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        factory: '',
        status: 'active',
        emailAlertEnabled: 'yes'
    });

    const [errors, setErrors] = useState({});

    // Reset form when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '', // Never show existing password
                role: user.role || 'user',
                factory: user.factory || '',
                status: user.status || 'active',
                emailAlertEnabled: user.emailAlertEnabled || 'yes'
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'user',
                factory: '',
                status: 'active',
                emailAlertEnabled: 'yes'
            });
        }
        setErrors({});
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = t('auth.enterName', 'Name is required');
        if (!formData.email.trim()) newErrors.email = t('auth.enterEmail', 'Email is required');
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        
        if (!isEditing && !formData.password) newErrors.password = t('auth.enterPassword', 'Password is required for new users');
        if (formData.password && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        
        if (!formData.role) newErrors.role = 'Role is required';
        if (!formData.factory) newErrors.factory = t('auth.pleaseSelectFactory', 'Factory is required');
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    const inputClasses = "w-full px-4 py-2.5 bg-surface-alt border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted/50";
    const errorClasses = "border-error focus:border-error focus:ring-error/20";
    // Thêm flex và gap để căn chỉnh icon với text cho đẹp
    const labelClasses = "flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5";

    return (
        <div className="flex flex-col h-full bg-surface rounded-2xl border border-border shadow-sm overflow-hidden scrollbar-hide auto-fade-in">
            {/* Header */}
            <div className="p-[10px_18px] border-b border-border bg-surface-alt/50">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {isEditing ? t('admin.editUser', 'Edit User') : t('admin.addUser', 'Add User')}
                </h2>
                <p className="text-sm text-text-muted mt-1">
                    {isEditing ? t('admin.editUserDesc', 'Update user account information') : t('admin.addUserDesc', 'Create a new user account')}
                </p>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">    
                <form id="user-editor-form" onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className={labelClasses}>
                            <User size={16} />
                            {t('auth.fullName', 'Full Name')} <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`${inputClasses} ${errors.name ? errorClasses : ''}`}
                            placeholder="John Doe"
                        />
                        {errors.name && <p className="mt-1.5 text-xs text-error flex items-center gap-1"><AlertCircle size={12}/>{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className={labelClasses}>
                            <Mail size={16} />
                            {t('auth.email', 'Email')} <span className="text-error">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`${inputClasses} ${errors.email ? errorClasses : ''}`}
                            placeholder="john@example.com"
                            autoComplete="off"
                        />
                        {errors.email && <p className="mt-1.5 text-xs text-error flex items-center gap-1"><AlertCircle size={12}/>{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className={labelClasses}>
                            <Lock size={16} />
                            {t('auth.password', 'Password')} {!isEditing && <span className="text-error">*</span>}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`${inputClasses} ${errors.password ? errorClasses : ''}`}
                            placeholder={isEditing ? t('admin.leaveEmptyToKeepCurrentPassword', '••••••••') : "••••••••"}
                            autoComplete="new-password"
                        />
                         {errors.password && <p className="mt-1.5 text-xs text-error flex items-center gap-1"><AlertCircle size={12}/>{errors.password}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {/* Role */}
                        <div>
                            <label htmlFor="role" className={labelClasses}>
                                <Shield size={16} />
                                {t('profile.role', 'Role')} <span className="text-error">*</span>
                            </label>
                            <CustomSelect
                                name="role"
                                value={formData.role}
                                onChange={(val) => handleChange({ target: { name: 'role', value: val } })}
                                options={roles}
                                className={`${errors.role ? 'border-error' : ''}`}
                            />
                            {errors.role && <p className="mt-1.5 text-xs text-error">{errors.role}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label htmlFor="status" className={labelClasses}>
                                <Activity size={16} />
                                {t('dashboard.status', 'Status')}
                            </label>
                            <CustomSelect
                                name="status"
                                value={formData.status}
                                onChange={(val) => handleChange({ target: { name: 'status', value: val } })}
                                options={[
                                    { value: 'active', label: t('admin.statusActive', 'Active') },
                                    { value: 'inactive', label: t('admin.statusInactive', 'Inactive') }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Factory */}
                    <div>
                        <label htmlFor="factory" className={labelClasses}>
                            <FactoryIcon size={16} />
                            {t('auth.factory', 'Factory')} <span className="text-error">*</span>
                        </label>
                        <CustomSelect
                            name="factory"
                            value={formData.factory}
                            onChange={(val) => handleChange({ target: { name: 'factory', value: val } })}
                            options={factories}
                            placeholder={t('auth.selectFactory', 'Select factory')}
                            className={`${errors.factory ? 'border-error' : ''}`}
                        />
                        {errors.factory && <p className="mt-1.5 text-xs text-error">{errors.factory}</p>}
                    </div>

                    {/* Email Alert */}
                    <div>
                        <div className="mt-2 p-4 rounded-xl border border-border bg-surface-alt/30">
                            <CustomCheckbox
                                checked={formData.emailAlertEnabled === 'yes'}
                                onChange={(checked) => handleChange({ target: { name: 'emailAlertEnabled', value: checked ? 'yes' : 'no' } })}
                                label={
                                    <span className="flex items-center gap-1.5">
                                        {t('admin.emailAlert', 'Email Alert')}
                                    </span>
                                }
                                description={t('admin.emailAlertDesc', 'Receive email alerts for temperature and humidity warnings')}
                                className={`${errors.emailAlertEnabled ? 'border-error' : ''}`}
                            />
                        </div>
                        {errors.emailAlertEnabled && <p className="mt-1.5 text-xs text-error">{errors.emailAlertEnabled}</p>}
                    </div>

                </form>
            </div>

            {/* Footer / Actions */}
            <div className="p-6 border-t border-border bg-surface-alt/50 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={onCancel} type="button">
                    {t('admin.cancel', 'Cancel')}
                </Button>
                <Button variant="primary" form="user-editor-form" type="submit" className="min-w-[120px]">
                    <Save size={18} className="mr-2" />
                    {t('admin.save', 'Save Changes')}
                </Button>
            </div>
        </div>
    );
};

export default UserEditor;