import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../../../store';
import { isWarning, isTemperatureWarning, isHumidityWarning } from '../utils/warningUtils';

/**
 * Location List Item - displays combined temp & humidity for a factory location
 * With warning highlight when values exceed configurable thresholds
 */
const LocationListItem = ({ location, locationId, temperature, humidity, chartData = [], onClick }) => {
    const { t } = useTranslation();
    const { thresholds } = useSettingsStore();

    const hasWarning = isWarning(temperature, humidity, thresholds);
    const tempWarning = isTemperatureWarning(temperature, thresholds);
    const humWarning = isHumidityWarning(humidity, thresholds);

    return (
        <div
            onClick={onClick}
            className={`group bg-surface rounded-2xl px-8 py-6 border-2 shadow-sm grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto] gap-6 md:gap-8 items-center transition-all duration-300 hover:shadow-md hover:translate-x-2 cursor-pointer ${hasWarning
                ? 'border-warning shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:border-warning/80'
                : 'border-border hover:border-primary/20'
                }`}
        >
            {/* Icon with warning indicator */}
            <div className="relative">
                <div className={`w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-2xl border animate-pulse-icon ${hasWarning
                    ? 'bg-warning/10 text-warning border-warning/20'
                    : 'bg-temp/10 text-temp border-temp/20'
                    }`}>
                    🌡️
                </div>
                {hasWarning && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center shadow-lg">
                        <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold text-text-secondary">{location}</div>
                <div className="text-xs text-text-muted font-mono">ID: {locationId}</div>
                {hasWarning && (
                    <div className="flex items-center gap-1 text-warning text-xs font-medium mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{t('dashboard.warningValues', 'Giá trị ngoài ngưỡng an toàn')}</span>
                    </div>
                )}
            </div>

            {/* Readings */}
            <div className="flex gap-8 flex-col sm:flex-row">
                <div className="flex flex-col gap-1">
                    <div className={`text-xs uppercase tracking-wider ${tempWarning ? 'text-warning font-medium' : 'text-text-muted'
                        }`}>
                        {t('dashboard.temperature')}
                    </div>
                    <div className={`text-3xl font-bold font-mono bg-clip-text text-transparent ${tempWarning
                        ? 'bg-warning'
                        : 'bg-gradient-to-r from-temp to-temp-end'
                        }`}>
                        {temperature}°C
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className={`text-xs uppercase tracking-wider ${humWarning ? 'text-warning font-medium' : 'text-text-muted'
                        }`}>
                        {t('dashboard.humidity')}
                    </div>
                    <div className={`text-3xl font-bold font-mono bg-clip-text text-transparent ${humWarning
                        ? 'bg-warning'
                        : 'bg-gradient-to-r from-humidity to-humidity-end'
                        }`}>
                        {humidity}%
                    </div>
                </div>
            </div>

            {/* Mini chart */}
            {/* <div className="w-[120px] h-[40px] flex items-end gap-[3px]">
                {chartData.map((height, i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-sm transition-all duration-300 ${hasWarning
                            ? 'bg-gradient-to-t from-warning/30 to-warning/70 group-hover:from-warning/40 group-hover:to-warning/80'
                            : 'bg-gradient-to-t from-primary/30 to-primary/70 group-hover:from-secondary/40 group-hover:to-secondary/80'
                            }`}
                        style={{ height: `${height}%` }}
                    />
                ))}
            </div> */}
        </div>
    );
};

export default LocationListItem;
