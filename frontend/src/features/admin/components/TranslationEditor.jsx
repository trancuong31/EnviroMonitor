import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Pen,
    AlertCircle,
    FileText,
    Languages,
} from 'lucide-react';

const TranslationEditor = ({ translation, onSave }) => {
    const { t } = useTranslation();
    const isEditing = !!translation?.ID;

    const [formData, setFormData] = useState({
        description: '',
        vi: '',
        en: '',
        kr: '',
    });

    const [errors, setErrors] = useState({});

    // Reset form when translation changes
    useEffect(() => {
        if (translation) {
            setFormData({
                description: translation.DESCRIPTION || '',
                vi: translation.VI || '',
                en: translation.EN || '',
                kr: translation.KR || '',
            });
        } else {
            setFormData({
                description: '',
                vi: '',
                en: '',
                kr: '',
            });
        }
        setErrors({});
    }, [translation]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.description.trim()) {
            newErrors.description = t('admin.keyRequired', 'Translation key is required');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    const inputClasses =
        'w-full px-4 py-2.5 bg-surface-alt border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted/50';
    const disabledClasses =
        'w-full px-4 py-2.5 bg-surface-alt/50 border border-border rounded-lg text-text-muted cursor-not-allowed opacity-70';
    const errorClasses = 'border-error focus:border-error focus:ring-error/20';
    const labelClasses = 'flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1.5';

    return (
        <div className="flex flex-col h-full bg-surface rounded-2xl border border-border shadow-sm overflow-hidden scrollbar-hide auto-fade-in">
            {/* Header */}
            <div className="p-[10px_18px] border-b border-border bg-surface-alt/50">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {isEditing
                        ? t('admin.editTranslation', 'Edit Translation')
                        : t('admin.selectTranslation', 'Select Translation')}
                </h2>
                <p className="text-sm text-text-muted mt-1">
                    {isEditing
                        ? t('admin.editTranslationDesc', 'Update translation values for each language')
                        : t('admin.selectTranslationDesc', 'Select a translation key from the list to edit')}
                </p>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <form id="translation-editor-form" onSubmit={handleSubmit} className="space-y-5">
                    {/* Key (Description) - Read only */}
                    <div>
                        <label htmlFor="description" className={labelClasses}>
                            <FileText size={16} />
                            {t('admin.translationKey')}
                        </label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            readOnly
                            className={disabledClasses}
                            tabIndex={-1}
                        />
                        {errors.description && (
                            <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Vietnamese */}
                    <div>
                        <label htmlFor="vi" className={labelClasses}>
                            <Languages size={16} />
                            <span className="inline-flex items-center gap-1">
                                VI
                            </span>
                        </label>
                        <textarea
                            id="vi"
                            name="vi"
                            value={formData.vi}
                            onChange={handleChange}
                            rows={3}
                            title={formData.vi}
                            disabled={!isEditing}
                            className={`${isEditing ? inputClasses : disabledClasses} ${errors.vi ? errorClasses : ''} resize-none`}
                            placeholder={isEditing ? t('admin.enterVietnamese', 'Enter Vietnamese translation...') : ''}
                        />
                    </div>

                    {/* English */}
                    <div>
                        <label htmlFor="en" className={labelClasses}>
                            <Languages size={16} />
                            <span className="inline-flex items-center gap-1">
                                EN
                            </span>
                        </label>
                        <textarea
                            id="en"
                            name="en"
                            value={formData.en}
                            onChange={handleChange}
                            rows={3}
                            title={formData.en}
                            disabled={!isEditing}
                            className={`${isEditing ? inputClasses : disabledClasses} ${errors.en ? errorClasses : ''} resize-none`}
                            placeholder={isEditing ? t('admin.enterEnglish', 'Enter English translation...') : ''}
                        />
                    </div>

                    {/* Korean */}
                    <div>
                        <label htmlFor="kr" className={labelClasses}>
                            <Languages size={16} />
                            <span className="inline-flex items-center gap-1">
                                KR
                            </span>
                        </label>
                        <textarea
                            id="kr"
                            name="kr"
                            value={formData.kr}
                            onChange={handleChange}
                            rows={3}
                            title={formData.kr}
                            disabled={!isEditing}
                            className={`${isEditing ? inputClasses : disabledClasses} ${errors.kr ? errorClasses : ''} resize-none`}
                            placeholder={isEditing ? t('admin.enterKorean', 'Enter Korean translation...') : ''}
                        />
                    </div>
                </form>
            </div>

            {/* Footer / Actions */}
            <div className="p-6 border-t border-border bg-surface-alt/50 flex justify-end">
                <button
                    onClick={handleSubmit}
                    type="button"
                    disabled={!isEditing}
                    className="btn-update"
                >
                    <Pen size={18} />
                    {t('admin.save', 'Update')}
                </button>
            </div>
        </div>
    );
};

export default TranslationEditor;
