import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DatePicker from 'react-datepicker';
import { format, setHours, setMinutes, setSeconds } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import 'react-datepicker/dist/react-datepicker.css';
import { ChartNoAxesCombined, SearchAlert, Thermometer, Droplets } from 'lucide-react';
import { getLogsByDateRange } from '../api/dashboardApi';

/**
 * Utility: Check if dark mode is active
 */
const useTheme = () => {
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        return () => observer.disconnect();
    }, []);

    return isDark;
};

/**
 * Theme-aware color palette
 */
const getThemeColors = (isDark) => ({
    // Background & Surface
    modalBg: isDark ? '#0b132b' : '#ffffff',
    headerBg: isDark ? '#0f1b3d' : '#f8fafc',
    cardBg: isDark ? '#0f1b3d' : '#ffffff',
    footerBg: isDark ? '#0f1b3d' : '#f9fafb',

    // Text
    textPrimary: isDark ? '#e6f1ff' : '#1f2937',
    textSecondary: isDark ? '#9fb3c8' : '#6b7280',
    textMuted: isDark ? '#64748b' : '#9ca3af',

    // Border
    border: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e5e7eb',
    borderLight: isDark ? 'rgba(56, 189, 248, 0.08)' : '#f3f4f6',

    // Chart colors
    tempColor: isDark ? '#ff5f5f' : '#ef4444',
    tempColorEnd: isDark ? '#ff9f43' : '#f97316',
    humColor: isDark ? '#2dd4bf' : '#0ea5e9',
    humColorEnd: isDark ? '#38bdf8' : '#06b6d4',

    // Grid & Axis
    gridColor: isDark ? 'rgba(56, 189, 248, 0.08)' : '#f3f4f6',
    axisColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',

    // Tooltip
    tooltipBg: isDark ? '#132a55' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(56, 189, 248, 0.2)' : '#e5e7eb',
});

/**
 * Transform raw API logs into chart-ready data
 */
const transformLogsToChartData = (logs) => {
    if (!logs || logs.length === 0) return null;

    const categories = [];
    const tempData = [];
    const humData = [];
    const timestamps = [];

    logs.forEach((log) => {
        const date = new Date(log.log_date);
        categories.push(format(date, 'dd/MM HH:mm:ss'));
        tempData.push(log.value_0);
        humData.push(log.value_1);
        timestamps.push(date);
    });

    return { categories, tempData, humData, timestamps };
};

/**
 * Custom DatePicker Input
 */
const CustomDateInput = ({ value, onClick, isDark, colors, placeholder }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all outline-none min-w-[280px]"
        style={{
            backgroundColor: isDark ? '#132a55' : '#ffffff',
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`
        }}
    >
        <svg className="w-4 h-4" style={{ color: colors.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="truncate">{value || placeholder}</span>
    </button>
);

/**
 * Modal displaying temperature and humidity chart for a factory location
 * Features: Theme-aware, i18n, date range filter with time, Excel export
 */
const LocationChartModal = ({ isOpen, onClose, locationData }) => {
    const { t, i18n } = useTranslation();
    const isDark = useTheme();
    const modalRef = useRef(null);
    const chartRef = useRef(null);

    // Date range state (default: today 00:00 to now)
    const [startDate, setStartDate] = useState(() => {
        const start = new Date();
        return setSeconds(setMinutes(setHours(start, 0), 0), 0);
    });
    const [endDate, setEndDate] = useState(() => new Date());

    // Get theme colors
    const colors = useMemo(() => getThemeColors(isDark), [isDark]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Reset date when modal opens
    useEffect(() => {
        if (isOpen) {
            const start = new Date();
            setStartDate(setSeconds(setMinutes(setHours(start, 0), 0), 0));
            setEndDate(new Date());
        }
    }, [isOpen]);

    // Close on click outside
    const handleBackdropClick = useCallback((e) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    }, [onClose]);

    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    // Chart view mode: 'temperature' | 'humidity'
    const [chartMode, setChartMode] = useState('temperature');

    // Read thresholds fresh from localStorage each time modal opens
    const [thresholds, setThresholds] = useState(() => {
        try {
            const stored = localStorage.getItem('warningThresholds');
            return stored ? JSON.parse(stored) : { tempMin: 18, tempMax: 28, humMin: 40, humMax: 60 };
        } catch { return { tempMin: 18, tempMax: 28, humMin: 40, humMax: 60 }; }
    });

    // Refresh thresholds & reset chartMode every time modal opens
    useEffect(() => {
        if (isOpen) {
            try {
                const stored = localStorage.getItem('warningThresholds');
                if (stored) setThresholds(JSON.parse(stored));
            } catch { /* keep defaults */ }
            setChartMode('temperature');
        }
    }, [isOpen]);

    // Handle date range change
    const handleDateChange = useCallback((dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    }, []);

    // Set to today
    const handleToday = useCallback(() => {
        const now = new Date();
        setStartDate(setSeconds(setMinutes(setHours(now, 0), 0), 0));
        setEndDate(now);
    }, []);

    // Fetch chart data from API when date range changes
    useEffect(() => {
        if (!locationData || !startDate || !endDate) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const logs = await getLogsByDateRange(
                    locationData.locationId,
                    startDate.toISOString(),
                    endDate.toISOString()
                );
                setChartData(transformLogsToChartData(logs));
            } catch (error) {
                console.error('Failed to fetch chart data:', error);
                setChartData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [locationData, startDate, endDate]);

    // Export to Excel
    const handleExportExcel = useCallback(() => {
        if (!chartData || !locationData) return;

        const data = chartData.timestamps.map((timestamp, index) => ({
            [t('dashboard.time', 'Thời gian')]: format(timestamp, 'dd/MM/yyyy HH:mm:ss'),
            [t('dashboard.temperature', 'Nhiệt độ') + ' (°C)']: chartData.tempData[index],
            [t('dashboard.humidity', 'Độ ẩm') + ' (%)']: chartData.humData[index]
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');

        // Set column widths
        ws['!cols'] = [
            { wch: 22 },
            { wch: 18 },
            { wch: 15 }
        ];

        const startStr = format(startDate, 'yyyyMMdd_HHmm');
        const endStr = format(endDate, 'yyyyMMdd_HHmm');
        const filename = `${locationData.locationId}_${startStr}_${endStr}.xlsx`;

        XLSX.writeFile(wb, filename);
    }, [chartData, locationData, startDate, endDate, t]);

    // Chart options with theme support
    const chartOptions = useMemo(() => {
        if (!chartData || !locationData) return null;

        const dataLength = chartData.tempData.length;
        const isTemp = chartMode === 'temperature';

        const chartColor = isTemp ? colors.tempColor : colors.humColor;
        const uclValue = isTemp ? thresholds.tempMax : thresholds.humMax;
        const lclValue = isTemp ? thresholds.tempMin : thresholds.humMin;

        // UCL / LCL as constant horizontal series (reliable, no plotLine merge issues)
        const uclData = Array(dataLength).fill(uclValue);
        const lclData = Array(dataLength).fill(lclValue);

        return {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                style: { fontFamily: 'inherit' },
                height: 350,
                spacing: [20, 20, 20, 20],
                zooming: { type: 'x' }
            },
            title: {
                text: isTemp
                    ? t('dashboard.chartTitleTemp', 'Biểu đồ nhiệt độ')
                    : t('dashboard.chartTitleHum', 'Biểu đồ độ ẩm'),
                style: {
                    color: colors.textPrimary,
                    fontSize: '15px',
                    fontWeight: '600'
                }
            },
            subtitle: {
                text: `${t('dashboard.sensorId', 'Mã vị trí')}: ${locationData.locationId}`,
                style: {
                    color: colors.textSecondary,
                    fontSize: '12px'
                }
            },
            xAxis: {
                categories: chartData.categories,
                labels: {
                    style: { color: colors.textMuted, fontSize: '10px' },
                    rotation: -45,
                    step: Math.ceil(chartData.categories.length / 10)
                },
                lineColor: colors.axisColor,
                tickColor: colors.axisColor,
                title: {
                    text: t('dashboard.time', 'Thời gian'),
                    style: { color: colors.textSecondary, fontSize: '11px' }
                }
            },
            yAxis: [{
                title: {
                    text: isTemp
                        ? t('dashboard.temperature', 'Nhiệt độ') + ' (°C)'
                        : t('dashboard.humidity', 'Độ ẩm') + ' (%)',
                    style: { color: chartColor, fontSize: '11px' }
                },
                labels: {
                    format: isTemp ? '{value}°' : '{value}%',
                    style: { color: chartColor, fontSize: '10px' }
                },
                gridLineColor: colors.gridColor,
                gridLineDashStyle: 'Dash'
            }],
            plotOptions: {
                line: {
                    dataLabels: { enabled: false },
                    enableMouseTracking: true,
                    lineWidth: 2.5
                }
            },
            tooltip: {
                shared: true,
                backgroundColor: colors.tooltipBg,
                borderColor: colors.tooltipBorder,
                borderRadius: 10,
                shadow: true,
                style: { color: colors.textPrimary, fontSize: '12px' },
                headerFormat: '<span style="font-size:11px;font-weight:600">{point.key}</span><br/>',
                pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>{point.y}</b><br/>'
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                itemStyle: { color: colors.textSecondary, fontSize: '12px', fontWeight: '500' },
                itemHoverStyle: { color: colors.textPrimary }
            },
            series: [
                {
                    name: isTemp
                        ? t('dashboard.temperature', 'Nhiệt độ')
                        : t('dashboard.humidity', 'Độ ẩm'),
                    data: isTemp ? chartData.tempData : chartData.humData,
                    color: chartColor,
                    marker: { enabled: dataLength <= 30, radius: 3, symbol: 'circle' },
                    yAxis: 0,
                    zIndex: 2
                },
                {
                    name: `UCL (${uclValue})`,
                    data: uclData,
                    color: isDark ? '#ff6b6b' : '#ef4444',
                    dashStyle: 'Dash',
                    lineWidth: 1.5,
                    marker: { enabled: false },
                    enableMouseTracking: false,
                    yAxis: 0,
                    zIndex: 1
                },
                {
                    name: `LCL (${lclValue})`,
                    data: lclData,
                    color: isDark ? '#fbbf24' : '#f59e0b',
                    dashStyle: 'Dash',
                    lineWidth: 1.5,
                    marker: { enabled: false },
                    enableMouseTracking: false,
                    yAxis: 0,
                    zIndex: 1
                }
            ],
            credits: { enabled: false },
            responsive: {
                rules: [{
                    condition: { maxWidth: 500 },
                    chartOptions: {
                        xAxis: { labels: { step: Math.ceil(chartData.categories.length / 5) } },
                        legend: { layout: 'horizontal' }
                    }
                }]
            }
        };
    }, [chartData, locationData, colors, t, chartMode, thresholds, isDark]);

    if (!isOpen || !locationData) return null;

    return (
        <div
            ref={modalRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
        >
            <div
                className="relative rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden animate-slide-down border min-h-[600px]"
                style={{
                    backgroundColor: colors.modalBg,
                    borderColor: colors.border
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{
                        backgroundColor: colors.headerBg,
                        borderColor: colors.border
                    }}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                style={{ backgroundColor: isDark ? 'rgba(45, 212, 191, 0.1)' : '#ecfdf5' }}
                            >
                                <ChartNoAxesCombined />
                            </div>
                            <div>
                                <h2
                                    className="text-lg font-bold"
                                    style={{ color: colors.textPrimary }}
                                >
                                    {locationData.location}
                                </h2>
                                <p
                                    className="text-xs font-mono mt-0.5"
                                    style={{ color: colors.textMuted }}
                                >
                                    ID: {locationData.locationId}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                        style={{
                            color: colors.textMuted,
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6';
                            e.currentTarget.style.color = colors.textPrimary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = colors.textMuted;
                        }}
                        aria-label={t('common.close', 'Đóng')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Date Range Filter Bar */}
                <div
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b"
                    style={{
                        backgroundColor: isDark ? 'rgba(15, 27, 61, 0.5)' : '#fafbfc',
                        borderColor: colors.border
                    }}
                >
                    <div className="flex items-center gap-3">
                        <span
                            className="text-sm font-medium whitespace-nowrap"
                            style={{ color: colors.textSecondary }}
                        >
                            {t('dashboard.dateRange', 'Khoảng thời gian')}:
                        </span>

                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            showTimeSelect
                            timeFormat="HH:mm:ss"
                            timeIntervals={15}
                            timeCaption={t('dashboard.time', 'Thời gian')}
                            dateFormat="dd/MM/yyyy HH:mm:ss"
                            locale={i18n.language === 'vi' ? vi : enUS}
                            maxDate={new Date()}
                            customInput={
                                <CustomDateInput
                                    isDark={isDark}
                                    colors={colors}
                                    placeholder={t('dashboard.selectDateRange', 'Chọn khoảng thời gian')}
                                />
                            }
                            popperClassName={isDark ? 'datepicker-dark' : ''}
                            calendarClassName={isDark ? 'datepicker-calendar-dark' : ''}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToday}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                backgroundColor: isDark ? 'rgba(30, 167, 255, 0.15)' : '#eff6ff',
                                color: isDark ? '#5fd0ff' : '#2563eb'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(30, 167, 255, 0.25)' : '#dbeafe';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(30, 167, 255, 0.15)' : '#eff6ff';
                            }}
                        >
                            {t('dashboard.today', 'Hôm nay')}
                        </button>

                        <button
                            onClick={handleExportExcel}
                            disabled={!chartData}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
                                color: isDark ? '#4ade80' : '#15803d'
                            }}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(34, 197, 94, 0.25)' : '#bbf7d0';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7';
                            }}
                            title={t('dashboard.exportExcel', 'Xuất Excel')}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Excel
                        </button>
                    </div>
                </div>

                {/* Chart Mode Toggle */}
                <div
                    className="flex items-center gap-2 px-6 py-3 border-b"
                    style={{
                        backgroundColor: isDark ? 'rgba(15, 27, 61, 0.3)' : '#f8fafc',
                        borderColor: colors.border
                    }}
                >
                    <span className="text-xs font-medium mr-1" style={{ color: colors.textMuted }}>
                        {t('dashboard.chartView', 'Hiển thị')}:
                    </span>
                    {[
                        { key: 'temperature', icon: Thermometer, label: t('dashboard.temperature', 'Nhiệt độ') },
                        { key: 'humidity', icon: Droplets, label: t('dashboard.humidity', 'Độ ẩm') }
                    ].map(({ key, icon: Icon, label }) => {
                        const isActive = chartMode === key;
                        const activeColor = key === 'temperature' ? colors.tempColor : colors.humColor;
                        return (
                            <button
                                key={key}
                                onClick={() => setChartMode(key)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                style={{
                                    backgroundColor: isActive
                                        ? (isDark ? `${activeColor}22` : `${activeColor}18`)
                                        : 'transparent',
                                    color: isActive ? activeColor : colors.textMuted,
                                    border: `1px solid ${isActive ? `${activeColor}44` : 'transparent'}`
                                }}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Current Values */}
                <div
                    className="grid grid-cols-2 gap-4 px-6 py-4"
                    style={{ backgroundColor: isDark ? 'rgba(11, 19, 43, 0.5)' : '#fafbfc' }}
                >
                    <div
                        className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-[1.02]"
                        style={{
                            backgroundColor: colors.cardBg,
                            borderColor: isDark ? 'rgba(255, 95, 95, 0.2)' : '#fee2e2'
                        }}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{
                                backgroundColor: isDark ? 'rgba(255, 95, 95, 0.1)' : '#fef2f2',
                                border: `1px solid ${isDark ? 'rgba(255, 95, 95, 0.2)' : '#fecaca'}`
                            }}
                        >
                            🌡️
                        </div>
                        <div>
                            <p
                                className="text-xs uppercase tracking-wider font-medium"
                                style={{ color: colors.textMuted }}
                            >
                                {t('dashboard.currentTemp', 'Nhiệt độ hiện tại')}
                            </p>
                            <p
                                className="text-2xl font-bold font-mono"
                                style={{ color: colors.tempColor }}
                            >
                                {locationData.temperature}°C
                            </p>
                        </div>
                    </div>

                    <div
                        className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-[1.02]"
                        style={{
                            backgroundColor: colors.cardBg,
                            borderColor: isDark ? 'rgba(45, 212, 191, 0.2)' : '#ccfbf1'
                        }}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{
                                backgroundColor: isDark ? 'rgba(45, 212, 191, 0.1)' : '#ecfdf5',
                                border: `1px solid ${isDark ? 'rgba(45, 212, 191, 0.2)' : '#99f6e4'}`
                            }}
                        >
                            💧
                        </div>
                        <div>
                            <p
                                className="text-xs uppercase tracking-wider font-medium"
                                style={{ color: colors.textMuted }}
                            >
                                {t('dashboard.currentHum', 'Độ ẩm hiện tại')}
                            </p>
                            <p
                                className="text-2xl font-bold font-mono"
                                style={{ color: colors.humColor }}
                            >
                                {locationData.humidity}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="px-6 py-4" style={{ backgroundColor: colors.modalBg }}>
                    {loading ? (
                        <div className="flex items-center justify-center h-[350px]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
                                    style={{ borderColor: colors.textMuted, borderTopColor: 'transparent' }} />
                                <span className="text-sm" style={{ color: colors.textMuted }}>
                                    {t('common.loading', 'Đang tải...')}
                                </span>
                            </div>
                        </div>
                    ) : chartOptions ? (
                        <HighchartsReact
                            key={`${chartMode}-${locationData?.locationId}`}
                            highcharts={Highcharts}
                            options={chartOptions}
                            ref={chartRef}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-[350px] ">
                            
                            <span className="text-sm" style={{ color: colors.textMuted }}>
                               <SearchAlert className="w-12 h-12 text-text-muted mx-auto mb-4" /> {t('dashboard.noData', 'Không có dữ liệu')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-t"
                    style={{
                        backgroundColor: colors.footerBg,
                        borderColor: colors.border
                    }}
                >
                    <p
                        className="text-sm"
                        style={{ color: colors.textMuted }}
                    >
                        {t('dashboard.lastUpdate', 'Cập nhật lần cuối')}: {locationData.lastUpdate}
                    </p>
                    <div className="flex items-center gap-2">
                        <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor:
                                    locationData.status === 'Normal' ? (isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7') :
                                        locationData.status === 'Hot' ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2') :
                                            locationData.status === 'Warm' ? (isDark ? 'rgba(249, 115, 22, 0.15)' : '#ffedd5') :
                                                locationData.status === 'Cool' ? (isDark ? 'rgba(6, 182, 212, 0.15)' : '#cffafe') :
                                                    locationData.status === 'High Humidity' ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe') :
                                                        (isDark ? 'rgba(107, 114, 128, 0.15)' : '#f3f4f6'),
                                color:
                                    locationData.status === 'Normal' ? (isDark ? '#4ade80' : '#15803d') :
                                        locationData.status === 'Hot' ? (isDark ? '#f87171' : '#b91c1c') :
                                            locationData.status === 'Warm' ? (isDark ? '#fb923c' : '#c2410c') :
                                                locationData.status === 'Cool' ? (isDark ? '#22d3ee' : '#0e7490') :
                                                    locationData.status === 'High Humidity' ? (isDark ? '#60a5fa' : '#1d4ed8') :
                                                        colors.textSecondary
                            }}
                        >
                            {locationData.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* DatePicker dark mode styles */}
            <style>{`
                .datepicker-dark .react-datepicker {
                    background-color: #132a55 !important;
                    border-color: rgba(56, 189, 248, 0.2) !important;
                    color: #e6f1ff !important;
                }
                .datepicker-dark .react-datepicker__header {
                    background-color: #0f1b3d !important;
                    border-color: rgba(56, 189, 248, 0.15) !important;
                }
                .datepicker-dark .react-datepicker__current-month,
                .datepicker-dark .react-datepicker__day-name,
                .datepicker-dark .react-datepicker-time__header {
                    color: #e6f1ff !important;
                }
                .datepicker-dark .react-datepicker__day {
                    color: #9fb3c8 !important;
                }
                .datepicker-dark .react-datepicker__day:hover {
                    background-color: rgba(30, 167, 255, 0.2) !important;
                    color: #fff !important;
                }
                .datepicker-dark .react-datepicker__day--selected,
                .datepicker-dark .react-datepicker__day--in-range,
                .datepicker-dark .react-datepicker__day--in-selecting-range {
                    background-color: #1ea7ff !important;
                    color: #fff !important;
                }
                .datepicker-dark .react-datepicker__day--keyboard-selected {
                    background-color: rgba(30, 167, 255, 0.3) !important;
                }
                .datepicker-dark .react-datepicker__day--disabled {
                    color: #4a5568 !important;
                }
                .datepicker-dark .react-datepicker__time-container {
                    border-color: rgba(56, 189, 248, 0.15) !important;
                }
                .datepicker-dark .react-datepicker__time {
                    background-color: #132a55 !important;
                }
                .datepicker-dark .react-datepicker__time-list-item {
                    color: #9fb3c8 !important;
                }
                .datepicker-dark .react-datepicker__time-list-item:hover {
                    background-color: rgba(30, 167, 255, 0.2) !important;
                    color: #fff !important;
                }
                .datepicker-dark .react-datepicker__time-list-item--selected {
                    background-color: #1ea7ff !important;
                    color: #fff !important;
                }
                .datepicker-dark .react-datepicker__navigation-icon::before {
                    border-color: #9fb3c8 !important;
                }
                .datepicker-dark .react-datepicker__triangle {
                    display: none;
                }
                
                /* Light mode enhancements */
                .react-datepicker {
                    font-family: inherit !important;
                    border-radius: 12px !important;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
                }
                .react-datepicker__header {
                    border-radius: 12px 12px 0 0 !important;
                }
                .react-datepicker__day--selected,
                .react-datepicker__day--in-range {
                    border-radius: 8px !important;
                }
            `}</style>
        </div>
    );
};

export default LocationChartModal;
