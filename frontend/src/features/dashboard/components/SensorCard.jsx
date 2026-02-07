import { useTranslation } from 'react-i18next';

/**
 * IoT Sensor Card - displays both temperature & humidity for a location
 */
const SensorCard = ({ location, sensorIds, temperature, humidity, lastUpdate, status = 'Normal' }) => {
    const { t } = useTranslation();
    const tempPercent = Math.min(100, (parseFloat(temperature) / 50) * 100);
    const humPercent = Math.min(100, parseFloat(humidity));

    return (
        <div className="group relative bg-surface rounded-[20px] p-7 border border-border overflow-hidden transition-all duration-400 cursor-pointer hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.12)] hover:border-primary/20">
            {/* Hover glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,106,240,0.04)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

            {/* Header: icons + status */}
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-temp/10 text-temp border border-temp/20 animate-pulse-icon">
                        🌡️
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-humidity/10 text-humidity border border-humidity/20 animate-pulse-icon">
                        💧
                    </div>
                </div>
                {/* <div className="flex items-center gap-2 text-xs text-text-muted font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-blink" />
                    ONLINE
                </div> */}
            </div>

            {/* Location & ID */}
            <div className="relative z-10 mb-6">
                <div className="text-text text-[0.95rem] font-semibold">{location}</div>
                <div className="text-text-muted text-xs font-mono mt-1">ID: {sensorIds}</div>
            </div>

            {/* Readings - side by side */}
            <div className="grid grid-cols-2 gap-5 relative z-10 mb-6">
                {/* Temperature */}
                <div>
                    <div className="text-text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-2">{t('dashboard.temperature')}</div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[2.2rem] font-bold font-mono tracking-tight leading-none bg-gradient-to-r from-temp to-temp-end bg-clip-text text-transparent">
                            {temperature}
                        </span>
                        <span className="text-sm text-text-muted font-semibold">°C</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden mt-3">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-temp to-temp-end transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${tempPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>

                {/* Humidity */}
                <div>
                    <div className="text-text-muted text-[0.7rem] uppercase tracking-wider font-semibold mb-2">{t('dashboard.humidity')}</div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[2.2rem] font-bold font-mono tracking-tight leading-none bg-gradient-to-r from-humidity to-humidity-end bg-clip-text text-transparent">
                            {humidity}
                        </span>
                        <span className="text-sm text-text-muted font-semibold">%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden mt-3">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-humidity to-humidity-end transition-all duration-1000 ease-out relative overflow-hidden"
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
                <div className="font-medium">{status}</div>
            </div>
        </div>
    );
};

export default SensorCard;
