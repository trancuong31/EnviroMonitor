import { useTranslation } from 'react-i18next';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { useSettingsStore } from '../../../store';
import { isWarning, isTemperatureWarning, isHumidityWarning, getWarningStatus } from '../utils/warningUtils';

/**
 * Location Card - displays both temperature & humidity for a factory location
 * With warning highlight when values exceed configurable thresholds
 */
const LocationCard = ({ location, locationId, temperature, humidity, sensorType = 'ROOM', lastUpdate, lastUpdateISO, status = 'Normal', onClick }) => {
    const { t } = useTranslation();
    const thresholds = useSettingsStore((s) => (sensorType === 'FRIDGE' ? s.fridge : s.room));
    const ngThreshold = useSettingsStore((s) => s.ng);

    const isOffline = lastUpdateISO ? (Date.now() - new Date(lastUpdateISO).getTime()) / 60000 > ngThreshold : false;

    const finalTemp = isOffline ? 0 : temperature;
    const finalHum = isOffline ? 0 : humidity;

    const tempPercent = Math.min(100, (parseFloat(finalTemp) / 50) * 100);
    const humPercent = Math.min(100, parseFloat(finalHum));

    const tempWarning = isOffline ? false : isTemperatureWarning(temperature, thresholds);
    const humWarning = isOffline ? false : isHumidityWarning(humidity, thresholds);
    const hasThresholdWarning = tempWarning || humWarning;
    const hasWarning = hasThresholdWarning;

    // const warningText = getWarningStatus(temperature, humidity, thresholds, t);
    const displayStatus = isOffline ? 'OFFLINE' : (hasWarning);

    return (
        <div
            onClick={onClick}
            className={`group relative bg-surface rounded-xl px-3 py-4 border-2 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                isOffline
                    ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.15)] hover:border-red-500/80'
                    : hasWarning
                        ? 'border-warning shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:border-warning/80'
                        : 'border-border hover:border-primary/20'
                }`}
        >
            {/* Warning glow effect */}
            {hasWarning && !isOffline && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08)_0%,transparent_60%)] pointer-events-none" />
            )}
            {isOffline && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.08)_0%,transparent_60%)] pointer-events-none" />
            )}

            {/* Hover glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,106,240,0.04)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Row 1: Location name + status */}
            <div className="relative z-10 flex items-center justify-between mb-1">
                <div className="text-text text-[0.72rem] font-semibold truncate leading-tight">{location?.substring(6)}</div>
                {(isOffline || hasWarning) && (
                    <span className={`text-[0.55rem] font-bold uppercase ml-1 shrink-0 ${isOffline ? 'text-red-500' : 'text-warning'}`}>
                        {isOffline ? 'NG' : '⚠'}
                    </span>
                )}
            </div>

            {/* Row 2: Temperature & Humidity values inline */}
            <div className="relative z-10 flex items-center gap-3">
                {/* Temperature */}
                <div className="flex items-baseline gap-0.5">
                    <span className={`text-[1.1rem] font-bold font-mono tracking-tight leading-none bg-clip-text text-transparent ${
                        isOffline
                            ? 'bg-red-500'
                            : tempWarning
                                ? 'bg-gradient-to-r from-warning to-warning'
                                : 'bg-gradient-to-r from-temp to-temp-end'
                        }`}>
                        {finalTemp}
                    </span>
                    <span className="text-[0.6rem] text-text-muted font-semibold">°C</span>
                </div>

                {/* Divider */}
                <div className="w-px h-4 bg-border/60" />

                {/* Humidity */}
                <div className="flex items-baseline gap-0.5">
                    <span className={`text-[1.1rem] font-bold font-mono tracking-tight leading-none bg-clip-text text-transparent ${
                        isOffline 
                            ? 'bg-red-500'
                            : humWarning
                                ? 'bg-gradient-to-r from-warning to-warning'
                                : 'bg-gradient-to-r from-humidity to-humidity-end'
                        }`}>
                        {finalHum}
                    </span>
                    <span className="text-[0.6rem] text-text-muted font-semibold">%</span>
                </div>
            </div>

            {/* Row 3: Mini progress bars */}
            <div className="relative z-10 flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-[3px] bg-border/50 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            isOffline 
                                ? 'bg-red-500'
                                : tempWarning
                                    ? 'bg-warning'
                                    : 'bg-gradient-to-r from-temp to-temp-end'
                            }`}
                        style={{ width: `${tempPercent}%` }}
                    />
                </div>
                <div className="flex-1 h-[3px] bg-border/50 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            isOffline 
                                ? 'bg-red-500'
                                : humWarning
                                    ? 'bg-warning'
                                    : 'bg-gradient-to-r from-humidity to-humidity-end'
                            }`}
                        style={{ width: `${humPercent}%` }}
                    />
                </div>
            </div>

            {/* Row 4: Time */}
            <div className="relative z-10 flex items-center gap-1 mt-1 text-[0.65rem] text-text-muted/70">
                <span>⏱</span>
                <span>{lastUpdate}</span>
            </div>
        </div>
    );
};

export default LocationCard;
