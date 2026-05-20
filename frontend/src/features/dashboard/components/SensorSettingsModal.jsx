import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Thermometer, Droplets, Loader2, CircleAlert, Info } from 'lucide-react';
import { updateSensorSettings } from '../api/dashboardApi';
import { useSettingsStore } from '../../../store';
import { useDashboardStore } from '../store/useDashboardStore';
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
  color = 'primary',
}) => {
  const percent = ((value - min) / (max - min)) * 100;

  // Color classes based on type
  const colorClasses = {
    temp: {
      track: 'from-temp to-temp-end',
      thumb: 'border-temp bg-temp',
      text: 'text-temp',
    },
    humidity: {
      track: 'from-humidity to-humidity-end',
      thumb: 'border-humidity bg-humidity',
      text: 'text-humidity',
    },
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
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
};
const SensorSettingsModal = ({
  isOpen,
  onClose,
  locationData,
  currentThresholds,
  onSaveSuccess,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const sensorType = locationData?.sensorType || 'ROOM';
  const globalThresholds = useSettingsStore((s) => {
    const locStr = locationData?.location?.toUpperCase() || '';
    if (locStr.includes('_WHC_')) return s.WHC;
    if (locStr.includes('_WHN_')) return s.WHN;
    return s.PL || { tempMin: 0, tempMax: 50, humMin: 0, humMax: 100 };
  });

  const [formValues, setFormValues] = useState({
    temperatureMin: 0,
    temperatureMax: 50,
    humidityMin: 0,
    humidityMax: 100,
  });

  const [errors, setErrors] = useState({ temp: false, hum: false });

  useEffect(() => {
    if (isOpen && currentThresholds) {
      setFormValues({
        temperatureMin: currentThresholds.tempMin ?? globalThresholds.tempMin,
        temperatureMax: currentThresholds.tempMax ?? globalThresholds.tempMax,
        humidityMin: currentThresholds.humMin ?? globalThresholds.humMin,
        humidityMax: currentThresholds.humMax ?? globalThresholds.humMax,
      });
      setErrors({ temp: false, hum: false });
    }
  }, [isOpen, locationData, globalThresholds]);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    setErrors({ temp: false, hum: false });
  };

  const validate = () => {
    const tempError = formValues.temperatureMax <= formValues.temperatureMin;
    const humError = formValues.humidityMax <= formValues.humidityMin;
    setErrors({ temp: tempError, hum: humError });
    return !tempError && !humError;
  };
  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await updateSensorSettings(locationData.locationId, formValues);

      const { locations } = useDashboardStore.getState();
      const updated = locations.map((loc) =>
        loc.id === locationData.id
          ? {
              ...loc,
              tempMin: formValues.temperatureMin,
              tempMax: formValues.temperatureMax,
              humMin: formValues.humidityMin,
              humMax: formValues.humidityMax,
            }
          : loc
      );
      useDashboardStore.setState({ locations: updated });

      toast.success(t('settings.saveSuccess', 'Lưu cài đặt thành công'));
      if (onSaveSuccess) {
        onSaveSuccess(formValues);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save sensor settings:', error);
      toast.error(t('settings.saveError', 'Lỗi khi lưu cài đặt'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ==========================================
  // 2. STATE & BIẾN PHỤ TRỢ CHO GIAO DIỆN MỚI
  // ==========================================
  const [showTooltip, setShowTooltip] = useState(false);
  const tempMaxRange = sensorType === 'FRIDGE' ? 20 : 50;
  const tempBaseMin = sensorType === 'FRIDGE' ? -10 : 0;

  if (!isOpen || !locationData) return null;

  // ==========================================
  // 3. RENDER GIAO DIỆN MỚI (COPY TỪ THRESHOLD)
  // ==========================================
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-purple-500/5 to-primary/5">
          <div>
            <h2 className="text-lg font-semibold text-text">
              {t('settings.sensorSettings', 'Cài đặt sensor')}
            </h2>
            <p className="text-xs text-text-muted font-mono mt-0.5">{locationData.locationId}</p>
          </div>
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
                    {t(
                      'settings.thresholdNote',
                      'Các vị trí có giá trị ngoài ngưỡng này sẽ được đánh dấu cảnh báo.'
                    )}
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

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Temperature thresholds */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-temp">
              <Thermometer className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                {t('dashboard.temperature', 'Nhiệt độ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <RangeSliderInput
                label={t('settings.min', 'Tối thiểu')}
                value={formValues.temperatureMin}
                onChange={(val) => handleChange('temperatureMin', val)}
                min={tempBaseMin}
                max={tempMaxRange}
                step={0.5}
                unit="°C"
                color="temp"
              />
              <RangeSliderInput
                label={t('settings.max', 'Tối đa')}
                value={formValues.temperatureMax}
                onChange={(val) => handleChange('temperatureMax', val)}
                min={tempBaseMin}
                max={tempMaxRange}
                step={0.5}
                unit="°C"
                color="temp"
              />
            </div>

            {/* Visual range indicator for Temp */}
            <div className="relative h-3 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded-full overflow-hidden">
              {/* Safe zone highlight */}
              <div
                className="absolute top-0 h-full bg-surface/80 rounded-l-full"
                style={{
                  left: 0,
                  width: `${((formValues.temperatureMin - tempBaseMin) / tempMaxRange) * 100}%`,
                }}
              />
              <div
                className="absolute top-0 h-full bg-surface/80 rounded-r-full"
                style={{
                  left: `${((formValues.temperatureMax - tempBaseMin) / tempMaxRange) * 100}%`,
                  right: 0,
                }}
              />
              {/* Markers */}
              <div
                className="absolute top-0 w-0.5 h-full bg-temp shadow-lg"
                style={{
                  left: `${((formValues.temperatureMin - tempBaseMin) / tempMaxRange) * 100}%`,
                }}
              />
              <div
                className="absolute top-0 w-0.5 h-full bg-temp shadow-lg"
                style={{
                  left: `${((formValues.temperatureMax - tempBaseMin) / tempMaxRange) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-text-muted/60">
              <span>{t('settings.cold', 'Lạnh')}</span>
              <span>{t('settings.optimal', 'Tối ưu')}</span>
              <span>{t('settings.hot', 'Nóng')}</span>
            </div>

            {/* Validation Error */}
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
                {t('dashboard.humidity', 'Độ ẩm')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <RangeSliderInput
                label={t('settings.min', 'Tối thiểu')}
                value={formValues.humidityMin}
                onChange={(val) => handleChange('humidityMin', val)}
                min={0}
                max={100}
                step={1}
                unit="%"
                color="humidity"
              />
              <RangeSliderInput
                label={t('settings.max', 'Tối đa')}
                value={formValues.humidityMax}
                onChange={(val) => handleChange('humidityMax', val)}
                min={0}
                max={100}
                step={1}
                unit="%"
                color="humidity"
              />
            </div>

            {/* Visual range indicator for Humidity */}
            <div className="relative h-3 bg-gradient-to-r from-orange-400 via-cyan-400 to-blue-500 rounded-full overflow-hidden">
              {/* Safe zone highlight */}
              <div
                className="absolute top-0 h-full bg-surface/80 rounded-l-full"
                style={{ left: 0, width: `${formValues.humidityMin}%` }}
              />
              <div
                className="absolute top-0 h-full bg-surface/80 rounded-r-full"
                style={{ left: `${formValues.humidityMax}%`, right: 0 }}
              />
              {/* Markers */}
              <div
                className="absolute top-0 w-0.5 h-full bg-humidity shadow-lg"
                style={{ left: `${formValues.humidityMin}%` }}
              />
              <div
                className="absolute top-0 w-0.5 h-full bg-humidity shadow-lg"
                style={{ left: `${formValues.humidityMax}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-text-muted/60">
              <span>{t('settings.dry', 'Khô')}</span>
              <span>{t('settings.optimal', 'Tối ưu')}</span>
              <span>{t('settings.humid', 'Ẩm')}</span>
            </div>

            {/* Validation Error */}
            {errors.hum && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
                <CircleAlert className="w-4 h-4 text-red-500" />
                <span className="text-red-500 text-xs font-medium">
                  {t('settings.errorMaxMin', 'Giá trị tối đa phải lớn hơn tối thiểu')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-surface-alt/50">
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
  );
};

export default SensorSettingsModal;
