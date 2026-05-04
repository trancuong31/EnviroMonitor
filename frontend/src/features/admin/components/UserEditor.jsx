import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pen,
  AlertCircle,
  User,
  Mail,
  Lock,
  Shield,
  Activity,
  Factory as FactoryIcon,
  Layers,
  PlusCircle,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Button, CustomSelect, CustomCheckbox } from '../../../components/ui';

const UserEditor = ({
  user,
  onSave,
  onDelete,
  onAddNew,
  roles = [],
  factories = [],
  departments = [],
}) => {
  const { t } = useTranslation();
  const isEditing = !!user?.id;

  const [formData, setFormData] = useState({
    fullname: '',
    userid: '',
    password: '',
    role: 'User',
    factory: '',
    department: '',
    status: 'Active',
    emailAlert: 'No',
  });

  const [errors, setErrors] = useState({});

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        userid: user.userid || '',
        password: '',
        role: user.role || 'User',
        factory: user.factory || '',
        department: user.department || '',
        status: user.status || 'Active',
        emailAlert: user.emailAlert || 'No',
      });
    } else {
      setFormData({
        fullname: '',
        userid: '',
        password: '',
        role: 'User',
        factory: '',
        department: '',
        status: 'Active',
        emailAlert: 'No',
      });
    }
    setErrors({});
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'factory' && value === 'ALL') {
        newData.department = 'ALL';
      } else if (name === 'factory' && prev.factory === 'ALL' && value !== 'ALL') {
        newData.department = '';
      }

      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        if (name === 'factory' && value === 'ALL') {
          delete newErrors.department;
        }
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = t('auth.enterName', 'Name is required');
    if (!formData.userid.trim()) newErrors.userid = t('auth.enterEmail', 'Email is required');
    else if (!/\S+@\S+\.\S+/.test(formData.userid)) newErrors.userid = 'Invalid email format';

    if (!isEditing && !formData.password)
      newErrors.password = t('auth.enterPassword', 'Password is required for new users');

    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.factory) newErrors.factory = t('auth.pleaseSelectFactory', 'Factory is required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e, forceCreate = false) => {
    if (e) e.preventDefault();
    if (validate()) {
      const submissionData = {
        ...formData,
        department: formData.department === '' ? null : formData.department,
      };
      onSave(submissionData, forceCreate);
    }
  };

  const inputClasses =
    'w-full px-4 py-2.5 bg-surface-alt border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted/50';
  const errorClasses = 'border-error focus:border-error focus:ring-error/20';
  // Thêm flex và gap để căn chỉnh icon với text cho đẹp
  const labelClasses = 'flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5';

  return (
    <div className="flex flex-col h-full bg-surface rounded-2xl border border-border shadow-sm overflow-hidden scrollbar-hide auto-fade-in">
      {/* Header */}
      <div className="p-[10px_18px] border-b border-border bg-surface-alt/50">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {isEditing ? t('admin.editUser', 'Edit User') : t('admin.addUser', 'Add User')}
        </h2>
        <p className="text-sm text-text-muted mt-1">
          {isEditing
            ? t('admin.editUserDesc', 'Update user account information')
            : t('admin.addUserDesc', 'Create a new user account')}
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
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className={`${inputClasses} ${errors.fullname ? errorClasses : ''}`}
            />
            {errors.fullname && (
              <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.fullname}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClasses}>
              <Mail size={16} />
              {t('auth.email', 'Email')} <span className="text-error">*</span>
            </label>
            <input
              type="email"
              id="userid"
              name="userid"
              value={formData.userid}
              onChange={handleChange}
              className={`${inputClasses} ${errors.userid ? errorClasses : ''}`}
              placeholder="abc@example.com"
              autoComplete="off"
            />
            {errors.userid && (
              <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.userid}
              </p>
            )}
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
              placeholder={
                isEditing ? t('admin.leaveEmptyToKeepCurrentPassword', '••••••••') : '••••••••'
              }
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.password}
              </p>
            )}
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
                  { value: 'Active', label: t('admin.statusActive', 'Active') },
                  { value: 'Inactive', label: t('admin.statusInactive', 'Inactive') },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
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

            {/* Department */}
            <div className={formData.factory === 'ALL' ? 'opacity-60 cursor-not-allowed' : ''}>
              <label htmlFor="department" className={labelClasses}>
                <Layers size={16} />
                {t('auth.department', 'Department')}{' '}
              </label>
              <CustomSelect
                name="department"
                value={formData.department}
                onChange={(val) => handleChange({ target: { name: 'department', value: val } })}
                options={[
                  { value: '', label: `${t('admin.noDepartment', 'No Department')}` },
                  ...departments,
                ]}
                placeholder={
                  formData.factory === 'ALL'
                    ? 'ALL'
                    : t('auth.selectDepartment', 'Select department')
                }
                className={`${errors.department ? 'border-error' : ''} ${formData.factory === 'ALL' ? 'pointer-events-none' : ''}`}
                disabled={formData.factory === 'ALL'}
              />
              {errors.department && (
                <p className="mt-1.5 text-xs text-error">{errors.department}</p>
              )}
            </div>
          </div>
          {/* Email Alert */}
          <div>
            <div className="mt-2 p-4 rounded-xl border border-border bg-surface-alt/30">
              <CustomCheckbox
                checked={formData.emailAlert === 'Yes'}
                onChange={(checked) =>
                  handleChange({ target: { name: 'emailAlert', value: checked ? 'Yes' : 'No' } })
                }
                label={
                  <span className="flex items-center gap-1.5">
                    {t('admin.emailAlert', 'Email Alert')}
                  </span>
                }
                description={t(
                  'admin.emailAlertDesc',
                  'Receive email alerts for temperature and humidity warnings'
                )}
                className={`${errors.emailAlert ? 'border-error' : ''}`}
              />
            </div>
            {errors.emailAlert && <p className="mt-1.5 text-xs text-error">{errors.emailAlert}</p>}
          </div>
        </form>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 border-t border-border bg-surface-alt/50 grid grid-cols-3 gap-3">
        {/* Create Button */}
        <button
          onClick={(e) => handleSubmit(e, true)}
          type="button"
          className="btn-create"
        >
          <PlusCircle size={18} />
          {t('admin.addUser', 'Create')}
        </button>

        {/* Update Button */}
        <button
          onClick={(e) => handleSubmit(e, false)}
          type="button"
          disabled={!isEditing}
          className="btn-update"
        >
          <Pen size={18} />
          {t('admin.save', 'Update')}
        </button>

        {/* Delete Button */}
        <button
          onClick={() => user && onDelete(user)}
          type="button"
          disabled={!isEditing}
          className="btn-delete"
        >
          <Trash2 size={18} />
          {t('admin.deleteUser', 'Delete')}
        </button>
      </div>
    </div>
  );
};

export default UserEditor;
