import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../../../store';
import { isWarning, isTemperatureWarning, isHumidityWarning, getWarningStatus } from '../utils/warningUtils';

/**
 * Location Card - displays both temperature & humidity for a factory location
 * With warning highlight when values exceed configurable thresholds
 */
const LocationCard = ({ location, locationId, temperature, humidity, lastUpdate, status = 'Normal', onClick }) => {
    const { t } = useTranslation();
    const { thresholds } = useSettingsStore();

    const tempPercent = Math.min(100, (parseFloat(temperature) / 50) * 100);
    const humPercent = Math.min(100, parseFloat(humidity));

    const hasWarning = isWarning(temperature, humidity, thresholds);
    const tempWarning = isTemperatureWarning(temperature, thresholds);
    const humWarning = isHumidityWarning(humidity, thresholds);
    const warningText = getWarningStatus(temperature, humidity, thresholds, t);
    const displayStatus = hasWarning ? (warningText || t('dashboard.warning', 'Cảnh báo')) : status;

    return (
        <div
            onClick={onClick}
            className={`group relative bg-surface rounded-[20px] p-7 border-2 overflow-hidden transition-all duration-400 cursor-pointer hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.12)] ${hasWarning
                ? 'border-warning shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-warning/80 animate-pulse'
                : 'border-border hover:border-primary/20'
                }`}
        >
            {/* Warning glow effect */}
            {hasWarning && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08)_0%,transparent_60%)] pointer-events-none" />
            )}

            {/* Hover glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,106,240,0.04)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

            {/* Header: icons + warning badge */}
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border animate-pulse-icon ${hasWarning && tempWarning
                        ? 'bg-warning/10 text-warning border-warning/20'
                        : 'bg-temp/10 text-temp border-temp/20'
                        }`}>
                        🌡️
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border animate-pulse-icon ${hasWarning && humWarning
                        ? 'bg-warning/10 text-warning border-warning/20'
                        : 'bg-humidity/10 text-humidity border-humidity/20'
                        }`}>
                        💧
                    </div>
                </div>

                {/* Warning badge */}
                {hasWarning && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 text-warning rounded-lg text-xs font-semibold border border-warning/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{t('dashboard.warning', 'Cảnh báo')}</span>
                    </div>
                )}
            </div>

            {/* Location & ID */}
            <div className="relative z-10 mb-6">
                <div className="text-text text-[0.95rem] font-semibold">{location}</div>
                <div className="text-text-muted text-xs font-mono mt-1">ID: {locationId}</div>
            </div>

            {/* Readings - side by side */}
            <div className="grid grid-cols-2 gap-5 relative z-10 mb-6">
                {/* Temperature */}
                <div>
                    <div className={`text-[0.7rem] uppercase tracking-wider font-semibold mb-2 ${tempWarning ? 'text-warning' : 'text-text-muted'
                        }`}>
                        {t('dashboard.temperature')}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className={`text-[2.2rem] font-bold font-mono tracking-tight leading-none bg-clip-text text-transparent ${tempWarning
                            ? 'bg-gradient-to-r from-warning to-warning'
                            : 'bg-gradient-to-r from-temp to-temp-end'
                            }`}>
                            {temperature}
                        </span>
                        <span className="text-sm text-text-muted font-semibold">°C</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden mt-3">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${tempWarning
                                ? 'bg-warning'
                                : 'bg-gradient-to-r from-temp to-temp-end'
                                }`}
                            style={{ width: `${tempPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>

                {/* Humidity */}
                <div>
                    <div className={`text-[0.7rem] uppercase tracking-wider font-semibold mb-2 ${humWarning ? 'text-warning' : 'text-text-muted'
                        }`}>
                        {t('dashboard.humidity')}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className={`text-[2.2rem] font-bold font-mono tracking-tight leading-none bg-clip-text text-transparent ${humWarning
                            ? 'bg-gradient-to-r from-warning to-warning'
                            : 'bg-gradient-to-r from-humidity to-humidity-end'
                            }`}>
                            {humidity}
                        </span>
                        <span className="text-sm text-text-muted font-semibold">%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden mt-3">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${humWarning
                                ? 'bg-warning'
                                : 'bg-gradient-to-r from-humidity to-humidity-end'
                                }`}
                            style={{ width: `${humPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between pt-4 border-t border-border text-xs text-text-muted relative z-10">
                <div className="flex items-center gap-1.5">
                    <span>⏱</span>
                    <span>{lastUpdate}</span>
                </div>
                <div className={`font-medium ${hasWarning ? 'text-warning' : ''}`}>
                    {displayStatus}
                </div>
            </div>
        </div>
    );
};

export default LocationCard;
