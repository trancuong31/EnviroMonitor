import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, RotateCcw, Save, Thermometer, Droplets, Info, CircleAlert, Loader2, Clock } from 'lucide-react';
import { useSettingsStore, DEFAULT_THRESHOLDS } from '../../../store';
import { toast } from 'sonner';
/**
 * Range Slider with Number Input - modern dual-thumb style visualization
 */
const RangeSliderInput = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = '',
    color = 'primary'
}) => {
    const percent = ((value - min) / (max - min)) * 100;

    // Color classes based on type
    const colorClasses = {
        temp: {
            track: 'from-temp to-temp-end',
            thumb: 'border-temp bg-temp',
            text: 'text-temp'
        },
        humidity: {
            track: 'from-humidity to-humidity-end',
            thumb: 'border-humidity bg-humidity',
            text: 'text-humidity'
        }
    };

    const colors = colorClasses[color] || colorClasses.temp;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted font-medium">{label}</span>
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                        min={min}
                        max={max}
                        step={step}
                        className={`w-16 px-2 py-1 bg-surface-alt border border-border rounded-lg text-text font-mono text-sm text-center focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all ${colors.text}`}
                    />
                    <span className="text-xs text-text-muted">{unit}</span>
                </div>
            </div>

            {/* Custom Range Slider */}
            <div className="relative h-2 group">
                {/* Background track */}
                <div className="absolute inset-0 bg-border rounded-full" />

                {/* Filled track */}
                <div
                    className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${colors.track} transition-all duration-150`}
                    style={{ width: `${percent}%` }}
                />

                {/* Range input (invisible but functional) */}
                <input
                    type="range"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    min={min}
                    max={max}
                    step={step}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {/* Thumb indicator */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 ${colors.thumb} shadow-lg transition-all duration-150 group-hover:scale-110 pointer-events-none`}
                    style={{ left: `calc(${percent}% - 8px)` }}
                >
                    <div className="absolute inset-0 rounded-full bg-white/30" />
                </div>
            </div>

            {/* Min/Max labels */}
            <div className="flex justify-between text-[10px] text-text-muted/60">
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    );
};

/**
 * Tab button for switching between Fridge and Room settings
 */
const TabButton = ({ active, icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${active
            ? 'bg-primary text-white shadow-lg shadow-primary/25'
            : 'bg-surface-alt text-text-muted hover:text-text hover:bg-surface-hover'
            }`}
    >
        <span className="text-base">{icon}</span>
        {label}
    </button>
);

/**
 * ThresholdSettingsModal - Modal for configuring temperature and humidity warning thresholds
 * Features: Tabbed UI (Fridge / Room), range sliders with number inputs, saves to DB via API
 */
const ThresholdSettingsModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { fridge, room, ng, updateSettings, isLoading } = useSettingsStore();
    const [showTooltip, setShowTooltip] = useState(false);
    const [activeTab, setActiveTab] = useState('fridge');

    // Local state for form inputs
    const [formValues, setFormValues] = useState({ fridge, room, ng });
    const [errors, setErrors] = useState({ temp: false, hum: false });
    const [saveMessage, setSaveMessage] = useState(null);

    // Sync form values when modal opens or thresholds change
    useEffect(() => {
        if (isOpen) {
            setFormValues({ fridge, room, ng });
            setErrors({ temp: false, hum: false });
            setSaveMessage(null);
        }
    }, [isOpen, fridge, room, ng]);

    // Get current tab values
    const currentValues = formValues[activeTab];

    // Handle input changes
    const handleChange = (field, value) => {
        setFormValues(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], [field]: value },
        }));
        setErrors({ temp: false, hum: false });
        setSaveMessage(null);
    };

    // Validate thresholds
    const validateThresholds = () => {
        const vals = formValues[activeTab];
        const tempError = vals.tempMax <= vals.tempMin;
        const humError = vals.humMax <= vals.humMin;

        setErrors({ temp: tempError, hum: humError });

        return !tempError && !humError;
    };

    // Handle save with validation
    const handleSave = async () => {
        if (!validateThresholds()) return;

        const result = await updateSettings(activeTab, formValues[activeTab], { ng: formValues.ng });
        if (result.success) {
            toast.success(t('settings.saveSuccess', 'Lưu cài đặt thành công'));
            onClose();
        } else {
            toast.error(t('settings.saveError', 'Lỗi khi lưu cài đặt'));
        }
    };

    // Handle reset to defaults
    const handleReset = () => {
        setFormValues(prev => ({
            ...prev,
            [activeTab]: { ...DEFAULT_THRESHOLDS[activeTab] },
            ng: DEFAULT_THRESHOLDS.ng,
        }));
        setErrors({ temp: false, hum: false });
        setSaveMessage(null);
    };

    // Handle tab switch
    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setErrors({ temp: false, hum: false });
        setSaveMessage(null);
    };

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Temperature slider range varies by type
    const tempMaxRange = activeTab === 'fridge' ? 20 : 50;

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-md bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden animate-scale-in">
                {/* Header with tooltip */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
                    <h2 className="text-lg font-semibold text-text">
                        {t('settings.thresholdTitle', 'Cài đặt ngưỡng cảnh báo')}
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Info tooltip */}
                        <div className="relative">
                            <button
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                onClick={() => setShowTooltip(!showTooltip)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                                <Info className="w-4 h-4" />
                            </button>

                            {/* Tooltip */}
                            {showTooltip && (
                                <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-surface border border-border rounded-xl shadow-xl z-10 animate-fade-in">
                                    <div className="absolute -top-2 right-3 w-3 h-3 bg-surface border-l border-t border-border rotate-45" />
                                    <p className="text-xs text-text-muted leading-relaxed relative z-10">
                                        {t('settings.thresholdNote', 'Các vị trí có giá trị ngoài ngưỡng này sẽ được đánh dấu cảnh báo.')}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tab Buttons */}
                <div className="flex gap-2 px-6 pt-5 pb-2">
                    <TabButton
                        active={activeTab === 'fridge'}
                        icon=""
                        label={t('settings.fridgeTab', 'Tủ lạnh')}
                        onClick={() => handleTabSwitch('fridge')}
                    />
                    <TabButton
                        active={activeTab === 'room'}
                        icon=""
                        label={t('settings.roomTab', 'Nhiệt độ thường')}
                        onClick={() => handleTabSwitch('room')}
                    />
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* Temperature thresholds */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-temp">
                            <Thermometer className="w-5 h-5" />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                {t('settings.temperature', 'Nhiệt độ')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <RangeSliderInput
                                label={t('settings.min', 'Tối thiểu')}
                                value={currentValues.tempMin}
                                onChange={(val) => handleChange('tempMin', val)}
                                min={activeTab === 'fridge' ? -10 : 0}
                                max={tempMaxRange}
                                step={0.5}
                                unit="°C"
                                color="temp"
                            />
                            <RangeSliderInput
                                label={t('settings.max', 'Tối đa')}
                                value={currentValues.tempMax}
                                onChange={(val) => handleChange('tempMax', val)}
                                min={activeTab === 'fridge' ? -10 : 0}
                                max={tempMaxRange}
                                step={0.5}
                                unit="°C"
                                color="temp"
                            />
                        </div>

                        {/* Visual range indicator */}
                        <div className="relative h-3 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded-full overflow-hidden">
                            {/* Safe zone highlight */}
                            <div
                                className="absolute top-0 h-full bg-surface/80 rounded-l-full"
                                style={{ left: 0, width: `${((currentValues.tempMin - (activeTab === 'fridge' ? -10 : 0)) / tempMaxRange) * 100}%` }}
                            />
                            <div
                                className="absolute top-0 h-full bg-surface/80 rounded-r-full"
                                style={{ left: `${((currentValues.tempMax - (activeTab === 'fridge' ? -10 : 0)) / tempMaxRange) * 100}%`, right: 0 }}
                            />
                            {/* Markers */}
                            <div
                                className="absolute top-0 w-0.5 h-full bg-temp shadow-lg"
                                style={{ left: `${((currentValues.tempMin - (activeTab === 'fridge' ? -10 : 0)) / tempMaxRange) * 100}%` }}
                            />
                            <div
                                className="absolute top-0 w-0.5 h-full bg-temp shadow-lg"
                                style={{ left: `${((currentValues.tempMax - (activeTab === 'fridge' ? -10 : 0)) / tempMaxRange) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-text-muted/60">
                            <span>{t('settings.cold', 'Lạnh')}</span>
                            <span>{t('settings.optimal', 'Tối ưu')}</span>
                            <span>{t('settings.hot', 'Nóng')}</span>
                        </div>

                        {/* Temperature validation error */}
                        {errors.temp && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
                                <CircleAlert className="w-4 h-4 text-red-500" />
                                <span className="text-red-500 text-xs font-medium">
                                 {t('settings.errorMaxMin', 'Giá trị tối đa phải lớn hơn tối thiểu')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Humidity thresholds */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-humidity">
                            <Droplets className="w-5 h-5" />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                {t('settings.humidity', 'Độ ẩm')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <RangeSliderInput
                                label={t('settings.min', 'Tối thiểu')}
                                value={currentValues.humMin}
                                onChange={(val) => handleChange('humMin', val)}
                                min={0}
                                max={100}
                                step={1}
                                unit="%"
                                color="humidity"
                            />
                            <RangeSliderInput
                                label={t('settings.max', 'Tối đa')}
                                value={currentValues.humMax}
                                onChange={(val) => handleChange('humMax', val)}
                                min={0}
                                max={100}
                                step={1}
                                unit="%"
                                color="humidity"
                            />
                        </div>

                        {/* Visual range indicator */}
                        <div className="relative h-3 bg-gradient-to-r from-orange-400 via-cyan-400 to-blue-500 rounded-full overflow-hidden">
                            {/* Safe zone highlight */}
                            <div
                                className="absolute top-0 h-full bg-surface/80 rounded-l-full"
                                style={{ left: 0, width: `${currentValues.humMin}%` }}
                            />
                            <div
                                className="absolute top-0 h-full bg-surface/80 rounded-r-full"
                                style={{ left: `${currentValues.humMax}%`, right: 0 }}
                            />
                            {/* Markers */}
                            <div
                                className="absolute top-0 w-0.5 h-full bg-humidity shadow-lg"
                                style={{ left: `${currentValues.humMin}%` }}
                            />
                            <div
                                className="absolute top-0 w-0.5 h-full bg-humidity shadow-lg"
                                style={{ left: `${currentValues.humMax}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-text-muted/60">
                            <span>{t('settings.dry', 'Khô')}</span>
                            <span>{t('settings.optimal', 'Tối ưu')}</span>
                            <span>{t('settings.humid', 'Ẩm')}</span>
                        </div>

                        {/* Humidity validation error */}
                        {errors.hum && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
                                <CircleAlert className="w-4 h-4 text-red-500" />
                                <span className="text-red-500 text-xs font-medium">
                                     {t('settings.errorMaxMin', 'Giá trị tối đa phải lớn hơn tối thiểu')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Offline Threshold */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-text-muted">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                {t('settings.offlineThreshold', 'Thời gian cảnh báo Offline')}
                            </span>
                        </div>
                        <RangeSliderInput
                            label={t('settings.offlineMinutes', 'Số phút')}
                            value={formValues.ng}
                            onChange={(val) => setFormValues(prev => ({ ...prev, ng: val }))}
                            min={5}
                            max={200}
                            step={1}
                            unit={t('settings.minutes', ' phút')}
                            color="temp"
                        />
                    </div>

                    {/* Save message */}
                    {saveMessage && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg animate-fade-in ${saveMessage.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                            : 'bg-red-500/10 border border-red-500/20 text-red-500'
                            }`}>
                            <span className="text-xs font-medium">{saveMessage.text}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-alt/50">
                    <button
                        onClick={handleReset}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {t('settings.reset', 'Đặt lại mặc định')}
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
                        >
                            {t('settings.cancel', 'Hủy')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('settings.savingSettings', 'Đang lưu...')}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {t('settings.save', 'Lưu')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThresholdSettingsModal;
