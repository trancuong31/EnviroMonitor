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
                ? 'border-warning shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-warning/80'
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
            <div className="flex justify-between text-white items-start mb-5 relative z-10">
                <div className="flex items-center text-white gap-2 ">
                    <div className={`w-10 h-10 text-white rounded-xl flex items-center justify-center text-lg border animate-pulse-icon ${hasWarning && tempWarning
                        ? 'bg-warning/10 text-warning border-warning/30'
                        : 'bg-temp/10 text-temp border-temp/30'
                        }`}>🌡️
                        {/* <svg className="text-white" width="20" height="20" viewBox="0 0 9 20" fill="#7c889c" xmlns="http://www.w3.org/2000/svg"><path d="M5 13.8672C5.18229 13.9323 5.35156 14.0234 5.50781 14.1406C5.66406 14.2578 5.79427 14.3945 5.89844 14.5508C6.00911 14.7005 6.09375 14.8698 6.15234 15.0586C6.21745 15.2409 6.25 15.4297 6.25 15.625C6.25 15.8854 6.20117 16.1296 6.10352 16.3574C6.00586 16.5853 5.8724 16.7839 5.70312 16.9531C5.53385 17.1224 5.33529 17.2559 5.10742 17.3535C4.87956 17.4512 4.63542 17.5 4.375 17.5C4.11458 17.5 3.87044 17.4512 3.64258 17.3535C3.41471 17.2559 3.21615 17.1224 3.04688 16.9531C2.8776 16.7839 2.74414 16.5853 2.64648 16.3574C2.54883 16.1296 2.5 15.8854 2.5 15.625C2.5 15.4297 2.5293 15.2409 2.58789 15.0586C2.65299 14.8698 2.73763 14.7005 2.8418 14.5508C2.95247 14.3945 3.08268 14.2578 3.23242 14.1406C3.38867 14.0234 3.5612 13.9323 3.75 13.8672V7.5H5V13.8672ZM7.5 12.8809C7.87109 13.291 8.16081 13.7467 8.36914 14.248C8.57747 14.7493 8.68164 15.2767 8.68164 15.8301C8.68164 16.416 8.56445 16.9629 8.33008 17.4707C8.10221 17.9785 7.78971 18.4212 7.39258 18.7988C6.99544 19.1699 6.53646 19.4629 6.01562 19.6777C5.49479 19.8926 4.94792 20 4.375 20C3.79557 20 3.24544 19.8926 2.72461 19.6777C2.21029 19.4629 1.75456 19.1699 1.35742 18.7988C0.960286 18.4212 0.644531 17.9785 0.410156 17.4707C0.182292 16.9629 0.0683594 16.416 0.0683594 15.8301C0.0683594 15.2767 0.172526 14.7493 0.380859 14.248C0.589193 13.7467 0.878906 13.291 1.25 12.8809V3.125C1.25 2.69531 1.33138 2.29167 1.49414 1.91406C1.6569 1.53646 1.87826 1.20768 2.1582 0.927734C2.44466 0.641276 2.77669 0.416667 3.1543 0.253906C3.53841 0.0846354 3.94531 0 4.375 0C4.80469 0 5.20833 0.0846354 5.58594 0.253906C5.96354 0.416667 6.29232 0.641276 6.57227 0.927734C6.85872 1.20768 7.08333 1.53646 7.24609 1.91406C7.41536 2.29167 7.5 2.69531 7.5 3.125V12.8809ZM4.375 18.75C4.77865 18.75 5.16276 18.6751 5.52734 18.5254C5.89844 18.3757 6.22396 18.1706 6.50391 17.9102C6.78385 17.6497 7.00521 17.3405 7.16797 16.9824C7.33724 16.6243 7.42188 16.2402 7.42188 15.8301C7.42188 15.3418 7.31445 14.8958 7.09961 14.4922C6.88477 14.082 6.60156 13.7142 6.25 13.3887V3.125C6.25 2.86458 6.20117 2.62044 6.10352 2.39258C6.00586 2.16471 5.8724 1.96615 5.70312 1.79688C5.53385 1.6276 5.33529 1.49414 5.10742 1.39648C4.87956 1.29883 4.63542 1.25 4.375 1.25C4.11458 1.25 3.87044 1.29883 3.64258 1.39648C3.41471 1.49414 3.21615 1.6276 3.04688 1.79688C2.8776 1.96615 2.74414 2.16471 2.64648 2.39258C2.54883 2.62044 2.5 2.86458 2.5 3.125V13.3887C2.14844 13.7142 1.86523 14.082 1.65039 14.4922C1.43555 14.8958 1.32812 15.3418 1.32812 15.8301C1.32812 16.2402 1.40951 16.6243 1.57227 16.9824C1.74154 17.3405 1.96615 17.6497 2.24609 17.9102C2.52604 18.1706 2.84831 18.3757 3.21289 18.5254C3.58398 18.6751 3.97135 18.75 4.375 18.75Z"></path></svg> */}
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border animate-pulse-icon ${hasWarning && humWarning
                        ? 'bg-warning/10 text-warning border-warning/30'
                        : 'bg-humidity/10 text-humidity border-humidity/30'
                        }`}>💧
                            {/* <svg width="20" height="20" viewBox="0 0 14 14" fill="#7c889c" xmlns="http://www.w3.org/2000/svg"><path d="M13.3984 7.25C13.5964 7.59375 13.7448 7.95833 13.8438 8.34375C13.9479 8.72396 14 9.10938 14 9.5C14 10.1198 13.8802 10.7031 13.6406 11.25C13.4062 11.7969 13.0859 12.2734 12.6797 12.6797C12.2734 13.0859 11.7969 13.4089 11.25 13.6484C10.7031 13.8828 10.1198 14 9.5 14C8.88021 14 8.29688 13.8828 7.75 13.6484C7.20312 13.4089 6.72656 13.0859 6.32031 12.6797C5.91406 12.2734 5.59115 11.7969 5.35156 11.25C5.11719 10.7031 5 10.1198 5 9.5C5 9.10938 5.04948 8.72396 5.14844 8.34375C5.2526 7.95833 5.40365 7.59375 5.60156 7.25L9.5 0.5L13.3984 7.25ZM9.5 13C9.98438 13 10.4375 12.9089 10.8594 12.7266C11.2865 12.5391 11.6562 12.2891 11.9688 11.9766C12.2865 11.6589 12.5365 11.2891 12.7188 10.8672C12.9062 10.4401 13 9.98438 13 9.5C13 9.19271 12.9583 8.89062 12.875 8.59375C12.7969 8.29688 12.6823 8.01562 12.5312 7.75L9.5 2.5L6.46875 7.75C6.31771 8.01562 6.20052 8.29688 6.11719 8.59375C6.03906 8.89062 6 9.19271 6 9.5C6 9.98438 6.09115 10.4401 6.27344 10.8672C6.46094 11.2891 6.71094 11.6589 7.02344 11.9766C7.34115 12.2891 7.71094 12.5391 8.13281 12.7266C8.5599 12.9089 9.01562 13 9.5 13ZM0 1H3V14H0V13H2V11H1V10H2V8H0V7H2V5H1V4H2V2H0V1Z"></path></svg> */}
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
