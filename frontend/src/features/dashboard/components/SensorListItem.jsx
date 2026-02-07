import { useTranslation } from 'react-i18next';

/**
 * IoT Sensor List Item - displays combined temp & humidity for a location
 */
const SensorListItem = ({ location, sensorIds, temperature, humidity, chartData = [] }) => {
    const { t } = useTranslation();
    return (
        <div className="group bg-surface rounded-2xl px-8 py-6 border border-border shadow-sm grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto] gap-6 md:gap-8 items-center transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:translate-x-2">
            {/* Icon */}
            <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-2xl bg-temp/10 text-temp border border-temp/20 animate-pulse-icon">
                🌡️
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold text-text-secondary">{location}</div>
                <div className="text-xs text-text-muted font-mono">ID: {sensorIds}</div>
            </div>

            {/* Readings */}
            <div className="flex gap-8 flex-col sm:flex-row">
                <div className="flex flex-col gap-1">
                    <div className="text-xs text-text-muted uppercase tracking-wider">{t('dashboard.temperature')}</div>
                    <div className="text-3xl font-bold font-mono bg-gradient-to-r from-temp to-temp-end bg-clip-text text-transparent">
                        {temperature}°C
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-xs text-text-muted uppercase tracking-wider">{t('dashboard.humidity')}</div>
                    <div className="text-3xl font-bold font-mono bg-gradient-to-r from-humidity to-humidity-end bg-clip-text text-transparent">
                        {humidity}%
                    </div>
                </div>
            </div>

            {/* Mini chart */}
            <div className="w-[120px] h-[40px] flex items-end gap-[3px]">
                {chartData.map((height, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-primary/30 to-primary/70 group-hover:from-secondary/40 group-hover:to-secondary/80 transition-all duration-300"
                        style={{ height: `${height}%` }}
                    />
                ))}
            </div>
        </div>
    );
};

export default SensorListItem;
