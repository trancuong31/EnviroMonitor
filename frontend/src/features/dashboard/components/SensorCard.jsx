import { useTranslation } from 'react-i18next';
import { AlertTriangle, WifiOff, Clock, Thermometer, Droplets } from 'lucide-react';
import { useSettingsStore } from '../../../store';
import { isTemperatureWarning, isHumidityWarning } from '../utils/warningUtils';

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
    const hasWarning = tempWarning || humWarning;

    return (
        <div
            onClick={onClick}
            className={`group relative bg-surface rounded-xl p-3.5 border overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg ${
                isOffline
                    ? 'border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.15)] hover:border-red-500'
                    : hasWarning
                        ? 'border-warning/60 shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:border-warning'
                        : 'border-border hover:border-primary/40'
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

            {/* Header: Location name + Status Badge */}
            <div className="relative z-10 flex items-center justify-between mb-4.5">
                <div className="text-text xl:text-[16px] font-bold tracking-wide truncate" title={location}>
                    {location?.substring(6) || 'Unknown'}
                </div>
                {(isOffline || hasWarning) && (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider ${
                        isOffline ? 'bg-red-500/10 text-red-500' : 'bg-warning/10 text-warning'
                    }`}>
                        {isOffline ? <WifiOff className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                        <span>{isOffline ? 'OFFLINE' : 'WARNING'}</span>
                    </div>
                )}
            </div>

            {/* Body: Temperature & Humidity Columns */}
            <div className="relative z-10 flex items-center gap-4 mb-8">
                {/* Temperature Column */}
                <div className="flex flex-col flex-1 gap-1.5">
                    <div className="flex items-center gap-1 w-full justify-center">
                        <Thermometer
                            className={`flex-none w-[clamp(16px,1.8vw,20px)] h-[clamp(16px,1.8vw,20px)] ${
                                isOffline ? 'text-red-500' : tempWarning ? 'text-warning' : 'text-temp'
                            }`}
                        />
                        {/* Keep value+unit equal width between temp/hum */}
                        <div className="flex items-baseline justify-center min-w-[clamp(2.9rem,4.2vw,3.4rem)]">
                            <span
                                className={`flex-none tabular-nums xl:text-[1.2rem] 2xl:text-[1.6rem] font-bold font-mono tracking-tight leading-none bg-clip-text text-transparent ${
                                    isOffline
                                        ? 'bg-red-500'
                                        : tempWarning
                                          ? 'bg-gradient-to-r from-warning to-warning'
                                          : 'bg-gradient-to-r from-temp to-temp-end'
                                }`}
                            >
                                {finalTemp}
                            </span>
                            <span className="flex-none ml-0.5 text-[clamp(0.55rem,0.9vw,0.7rem)] text-gray-500 font-semibold leading-none">
                                °C
                            </span>
                        </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-[3px] bg-border/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isOffline ? 'bg-red-500' : tempWarning ? 'bg-warning' : 'bg-gradient-to-r from-temp to-temp-end'
                            }`}
                            style={{ width: `${tempPercent}%` }}
                        />
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-8 bg-border/60 self-center" />

                {/* Humidity Column */}
                <div className="flex flex-col flex-1 gap-1.5">
                    <div className="flex items-center gap-1 w-full justify-center">
                        <Droplets
                            className={`flex-none w-[clamp(16px,1.8vw,20px)] h-[clamp(16px,1.8vw,20px)] ${
                                isOffline ? 'text-red-500' : humWarning ? 'text-warning' : 'text-humidity'
                            }`}
                        />
                        {/* Keep value+unit equal width between temp/hum */}
                        <div className="flex items-baseline justify-center min-w-[clamp(2.9rem,4.2vw,3.4rem)]">
                            <span
                                className={`flex-none tabular-nums xl:text-[1.2rem] 2xl:text-[1.6rem] font-bold font-mono tracking-tight leading-none bg-clip-text text-transparent ${
                                    isOffline
                                        ? 'bg-red-500'
                                        : humWarning
                                          ? 'bg-gradient-to-r from-warning to-warning'
                                          : 'bg-gradient-to-r from-humidity to-humidity-end'
                                }`}
                            >
                                {finalHum}
                            </span>
                            <span className="flex-none ml-0.5 text-gray-500 font-semibold leading-none">
                                %
                            </span>
                        </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-[3px] bg-border/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isOffline ? 'bg-red-500' : humWarning ? 'bg-warning' : 'bg-gradient-to-r from-humidity to-humidity-end'
                            }`}
                            style={{ width: `${humPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer: Time Update */}
            <div className="relative z-10 flex items-center gap-1.5 pt-2.5 border-t border-border/40 text-[0.65rem] text-text-muted/60 font-medium">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className='text-sm text-gray-500'>{lastUpdate}</span>
            </div>
        </div>
    );
};

export default LocationCard;