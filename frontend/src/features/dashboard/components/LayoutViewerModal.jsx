import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Camera, MapPin } from 'lucide-react';
import { getLayoutDetail } from '../api/dashboardApi';
import api from '../../../services/api';

/**
 * Full-screen modal to display a layout (floor plan) image
 * with clickable sensor hotspot dots.
 * Clicking a hotspot reveals the sensor's real photo in a sidebar.
 *
 * @param {boolean} isOpen - controls modal visibility
 * @param {function} onClose - callback to close the modal
 * @param {string} position - layout position key (e.g. "V4_1F")
 */
const LayoutViewerModal = ({ isOpen, onClose, position }) => {
    const { t } = useTranslation();
    const [layoutData, setLayoutData] = useState(null);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Backend base URL without /api/v1
    const backendUrl = api.defaults.baseURL
        ? api.defaults.baseURL.replace(/\/api\/v1\/?$/, '')
        : '';

    /** Resolve a single path to a full URL */
    const buildUrl = useCallback(
        (path) => {
            if (!path) return null;
            if (path.startsWith('http')) return path;
            return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
        },
        [backendUrl]
    );

    /** Parse a raw image value (may be JSON array/string or plain string) → first URL */
    const resolveImageUrl = useCallback(
        (rawPath) => {
            if (!rawPath) return null;
            try {
                const parsed = JSON.parse(rawPath);
                const first = Array.isArray(parsed) ? parsed[0] : parsed;
                return buildUrl(first);
            } catch {
                return buildUrl(rawPath);
            }
        },
        [buildUrl]
    );

    /** Parse a raw image value → array of ALL URLs */
    const resolveAllImageUrls = useCallback(
        (rawPath) => {
            if (!rawPath) return [];
            try {
                const parsed = JSON.parse(rawPath);
                const arr = Array.isArray(parsed) ? parsed : [parsed];
                return arr.map(buildUrl).filter(Boolean);
            } catch {
                const url = buildUrl(rawPath);
                return url ? [url] : [];
            }
        },
        [buildUrl]
    );

    // Fetch layout + sensors when modal opens
    useEffect(() => {
        if (!isOpen || !position) return;

        let cancelled = false;
        const fetchData = async () => {
            setIsLoading(true);
            setSelectedSensor(null);
            try {
                const data = await getLayoutDetail(position);
                if (!cancelled) setLayoutData(data);
            } catch (err) {
                console.error('Failed to load layout detail:', err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, [isOpen, position]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSensorClick = (sensor) => {
        setSelectedSensor((prev) => (prev?.id === sensor.id ? null : sensor));
    };

    // Parse layout image (may be JSON array or plain string)
    let layoutImageUrl = null;
    if (layoutData?.layoutImage) {
        try {
            const parsed = JSON.parse(layoutData.layoutImage);
            layoutImageUrl = resolveImageUrl(
                Array.isArray(parsed) ? parsed[0] : parsed
            );
        } catch {
            layoutImageUrl = resolveImageUrl(layoutData.layoutImage);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

            {/* Modal container */}
            <div
                className="relative z-10 w-[95vw] max-w-[1400px] h-[90vh] bg-surface rounded-2xl border border-border shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-surface/80 backdrop-blur flex items-center justify-center text-text-muted hover:bg-[rgba(255,255,255,0.1)] transition-all duration-300 shadow-lg"
                    title={t('layout.close')}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur border border-border rounded-xl shadow-lg">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold font-mono text-text">{position}</span>
                    {layoutData?.sensors?.length > 0 && (
                        <span className="text-xs text-text-muted bg-surface-alt px-2 py-0.5 rounded-lg border border-border">
                            {layoutData.sensors.length} sensors
                        </span>
                    )}
                </div>

                {/* ── Left panel: Layout image + hotspots ── */}
                <div className="flex-1 relative overflow-auto bg-surface-alt flex items-center justify-center p-6 pt-16">
                    {isLoading && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <span className="text-text-muted text-sm">{t('dashboard.loading')}</span>
                        </div>
                    )}

                    {!isLoading && layoutImageUrl && (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="relative inline-block max-w-full max-h-full">
                                <img
                                    src={layoutImageUrl}
                                    alt={`${position} layout`}
                                    className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-lg"
                                    draggable={false}
                                />

                                {/* Sensor hotspot dots */}
                                {layoutData?.sensors?.map((sensor) => {
                                    const isActive = selectedSensor?.id === sensor.id;
                                    if (sensor.x == null || sensor.y == null) return null;

                                    return (
                                        <button
                                            key={sensor.id}
                                            className="absolute group"
                                            style={{
                                                left: `${sensor.x}%`,
                                                top: `${sensor.y}%`,
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                            onClick={() => handleSensorClick(sensor)}
                                            title={sensor.name}
                                        >
                                            {/* Pulse ring */}
                                            <span
                                                className={`absolute inset-0 rounded-full animate-ping ${
                                                    isActive
                                                        ? 'bg-primary/40'
                                                        : 'bg-red-500/30'
                                                }`}
                                                style={{ width: 24, height: 24, margin: '-4px' }}
                                            />
                                            {/* Dot */}
                                            <span
                                                className={`relative block w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-300 cursor-pointer ${
                                                    isActive
                                                        ? 'bg-primary scale-125 shadow-primary/50'
                                                        : 'bg-red-500 group-hover:scale-125 group-hover:bg-primary'
                                                }`}
                                            />
                                            {/* Label tooltip */}
                                            <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap text-[10px] font-mono font-semibold text-text bg-surface/90 backdrop-blur px-2 py-0.5 rounded-md border border-border shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                {sensor.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!isLoading && !layoutImageUrl && (
                        <div className="flex flex-col items-center gap-3 text-text-muted">
                            <Camera className="w-12 h-12 opacity-40" />
                            <span className="text-sm">{t('layout.noSensorImage')}</span>
                        </div>
                    )}
                </div>

                {/* ── Right sidebar: Selected sensor detail ── */}
                <div
                    className={`w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-border bg-surface flex flex-col transition-all duration-500 ${
                        selectedSensor ? 'max-h-[50vh] md:max-h-full opacity-100' : 'max-h-0 md:max-h-full md:w-0 lg:w-0 opacity-0 md:opacity-0 overflow-hidden'
                    }`}
                >
                    {selectedSensor && (
                        <div className="flex flex-col h-full animate-fade-in">
                            {/* Sidebar header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-semibold text-text">
                                        {t('layout.sensorImage')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedSensor(null)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-surface-alt transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Sensor name */}
                            <div className="px-5 py-3 border-b border-border">
                                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                                    Sensor
                                </span>
                                <p className="text-sm font-bold font-mono text-text mt-1">
                                    {selectedSensor.name}
                                </p>
                            </div>

                            {/* Sensor images gallery */}
                            <div className="flex-1 overflow-auto p-4 scrollbar-hide">
                                {(() => {
                                    const urls = resolveAllImageUrls(selectedSensor.image);
                                    if (urls.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-text-muted">
                                                <Camera className="w-10 h-10 opacity-40" />
                                                <span className="text-xs">{t('layout.noSensorImage')}</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="flex flex-col gap-3">
                                            {urls.map((url, idx) => (
                                                <div key={idx} className="relative">
                                                    {urls.length > 1 && (
                                                        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white bg-black/50 backdrop-blur px-2 py-0.5 rounded-md">
                                                            {idx + 1} / {urls.length}
                                                        </span>
                                                    )}
                                                    <img
                                                        src={url}
                                                        alt={`${selectedSensor.name} #${idx + 1}`}
                                                        className="w-full h-auto rounded-xl shadow-md object-contain bg-surface-alt border border-border"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LayoutViewerModal;
