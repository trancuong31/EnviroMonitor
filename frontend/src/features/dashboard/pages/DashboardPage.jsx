import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '../../../components/layout';
import { CustomSelect } from '../../../components/ui';
import { LocationCard, LocationListItem, LocationChartModal, ThresholdSettingsModal } from '../components';
import { Search, MapPin, Clock, ArrowUpDown, RefreshCw, LayoutGrid, List, Download, Settings } from 'lucide-react';

// Generate random chart data
const randChart = () => Array.from({ length: 7 }, () => Math.floor(Math.random() * 60) + 30);

// Parse "X phút trước" / "X giây trước" to minutes number for sorting/filtering
const parseMinutes = (str) => {
    if (str.includes('giây')) return 0;
    const m = parseInt(str, 10);
    return isNaN(m) ? 0 : m;
};

// Fake data
const initialLocations = [
    // ===== LINE A =====
    { id: 'LOC-A1-01', locationId: 'LOC-A1-01', location: 'Line A - Khu gia công - Tầng 1', temperature: 26.2, humidity: 63, lastUpdate: '1 phút trước', status: 'Normal', chartData: randChart() },
    { id: 'LOC-A1-02', locationId: 'LOC-A1-02', location: 'Line A - Khu lắp ráp - Tầng 1', temperature: 27.5, humidity: 65, lastUpdate: '2 phút trước', status: 'Warm', chartData: randChart() },

    { id: 'LOC-A2-01', locationId: 'LOC-A2-01', location: 'Line A - Khu QC - Tầng 2', temperature: 24.0, humidity: 55, lastUpdate: '3 phút trước', status: 'Normal', chartData: randChart() },
    { id: 'LOC-A2-02', locationId: 'LOC-A2-02', location: 'Line A - Phòng kỹ thuật - Tầng 2', temperature: 23.5, humidity: 52, lastUpdate: '1 phút trước', status: 'Normal', chartData: randChart() },

    { id: 'LOC-A3-01', locationId: 'LOC-A3-01', location: 'Line A - Kho bán thành phẩm - Tầng 3', temperature: 22.8, humidity: 60, lastUpdate: '4 phút trước', status: 'Normal', chartData: randChart() },

    // ===== LINE B =====
    { id: 'LOC-B1-01', locationId: 'LOC-B1-01', location: 'Line B - Khu ép nhựa - Tầng 1', temperature: 29.8, humidity: 70, lastUpdate: '1 phút trước', status: 'Hot', chartData: randChart() },
    { id: 'LOC-B1-02', locationId: 'LOC-B1-02', location: 'Line B - Khu đóng gói - Tầng 1', temperature: 26.0, humidity: 62, lastUpdate: '2 phút trước', status: 'Normal', chartData: randChart() },

    { id: 'LOC-B2-01', locationId: 'LOC-B2-01', location: 'Line B - Phòng kiểm tra chất lượng - Tầng 2', temperature: 24.5, humidity: 58, lastUpdate: '3 phút trước', status: 'Normal', chartData: randChart() },

    { id: 'LOC-B3-01', locationId: 'LOC-B3-01', location: 'Line B - Kho thành phẩm - Tầng 3', temperature: 21.5, humidity: 65, lastUpdate: '5 phút trước', status: 'High Humidity', chartData: randChart() },

    // ===== LINE C =====
    { id: 'LOC-C1-01', locationId: 'LOC-C1-01', location: 'Line C - Khu hàn - Tầng 1', temperature: 31.2, humidity: 68, lastUpdate: '1 phút trước', status: 'Hot', chartData: randChart() },
    { id: 'LOC-C1-02', locationId: 'LOC-C1-02', location: 'Line C - Khu bảo trì - Tầng 1', temperature: 28.0, humidity: 60, lastUpdate: '2 phút trước', status: 'Warm', chartData: randChart() },

    { id: 'LOC-C2-01', locationId: 'LOC-C2-01', location: 'Line C - Phòng điều khiển - Tầng 2', temperature: 22.0, humidity: 50, lastUpdate: '30 giây trước', status: 'Cool', chartData: randChart() },

    { id: 'LOC-C3-01', locationId: 'LOC-C3-01', location: 'Line C - Kho linh kiện - Tầng 3', temperature: 23.3, humidity: 67, lastUpdate: '4 phút trước', status: 'High Humidity', chartData: randChart() },
];

// Extract unique lines from locations
const lineOptions = [...new Set(initialLocations.map((l) => l.location.split(' - ')[0]))];

/**
 * Factory Location Dashboard page - monitors temperature & humidity
 */
const DashboardPage = () => {
    const { t } = useTranslation();
    const [view, setView] = useState('grid');
    const [locations, setLocations] = useState(initialLocations);
    const [search, setSearch] = useState('');
    const [filterLine, setFilterLine] = useState('all');
    const [filterTime, setFilterTime] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Handle location card click
    const handleLocationClick = useCallback((location) => {
        setSelectedLocation(location);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLocation(null);
    }, []);

    // Simulate real-time sensor updates
    const updateSensorData = useCallback(() => {
        setLocations((prev) =>
            prev.map((loc) => ({
                ...loc,
                temperature: parseFloat((loc.temperature + (Math.random() - 0.5) * 0.5).toFixed(1)),
                humidity: Math.max(0, Math.min(100, loc.humidity + Math.floor(Math.random() * 3 - 1))),
            }))
        );
    }, []);

    useEffect(() => {
        const interval = setInterval(updateSensorData, 5000);
        return () => clearInterval(interval);
    }, [updateSensorData]);

    // Refresh handler
    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        setLocations(initialLocations.map((loc) => ({ ...loc, chartData: randChart() })));
        setTimeout(() => setIsRefreshing(false), 600);
    }, []);

    // Filtered + sorted data
    const filteredLocations = useMemo(() => {
        let result = [...locations];

        // Search by location text
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((l) => l.location.toLowerCase().includes(q) || l.locationId.toLowerCase().includes(q));
        }

        // Filter by line
        if (filterLine !== 'all') {
            result = result.filter((l) => l.location.startsWith(filterLine));
        }

        // Filter by time
        if (filterTime !== 'all') {
            const maxMin = parseInt(filterTime, 10);
            result = result.filter((l) => parseMinutes(l.lastUpdate) < maxMin);
        }

        // Sort
        switch (sortBy) {
            case 'temp-asc':
                result.sort((a, b) => a.temperature - b.temperature);
                break;
            case 'temp-desc':
                result.sort((a, b) => b.temperature - a.temperature);
                break;
            case 'hum-asc':
                result.sort((a, b) => a.humidity - b.humidity);
                break;
            case 'hum-desc':
                result.sort((a, b) => b.humidity - a.humidity);
                break;
            case 'recent':
                result.sort((a, b) => parseMinutes(a.lastUpdate) - parseMinutes(b.lastUpdate));
                break;
            default:
                break;
        }

        return result;
    }, [locations, search, filterLine, filterTime, sortBy]);

    // Export to CSV handler
    const handleExport = useCallback(() => {
        // Get current date/time for filename
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');

        // CSV headers
        const headers = [
            t('dashboard.locationName', 'Vị trí'),
            t('dashboard.sensorId', 'Mã vị trí'),
            t('dashboard.temperature', 'Nhiệt độ') + ' (°C)',
            t('dashboard.humidity', 'Độ ẩm') + ' (%)',
            t('dashboard.lastUpdate', 'Cập nhật lần cuối'),
            t('dashboard.status', 'Trạng thái')
        ];

        // Convert filtered data to CSV rows
        const rows = filteredLocations.map(loc => [
            loc.location,
            loc.locationId,
            loc.temperature,
            Math.round(loc.humidity),
            loc.lastUpdate,
            loc.status
        ]);

        // Add BOM for Excel UTF-8 compatibility
        const BOM = '\uFEFF';
        const csvContent = BOM + [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `temperature-humidity-report-${timestamp}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, [filteredLocations, t]);

    // Translated options (must be inside component to react to language changes)
    const timeOptions = useMemo(() => [
        { label: t('dashboard.timeAll'), value: 'all' },
        { label: t('dashboard.timeLt1'), value: '1' },
        { label: t('dashboard.timeLt3'), value: '3' },
        { label: t('dashboard.timeLt5'), value: '5' },
    ], [t]);

    const sortOptions = useMemo(() => [
        { label: t('dashboard.sortDefault'), value: 'default' },
        { label: t('dashboard.sortTempAsc'), value: 'temp-asc' },
        { label: t('dashboard.sortTempDesc'), value: 'temp-desc' },
        { label: t('dashboard.sortHumAsc'), value: 'hum-asc' },
        { label: t('dashboard.sortHumDesc'), value: 'hum-desc' },
        { label: t('dashboard.sortRecent'), value: 'recent' },
    ], [t]);

    return (
        <MainLayout>
            <div className="min-h-full">
                <div className="max-w-[1400px] mx-auto p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-down">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold font-mono tracking-tight bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                                {t('dashboard.title')}
                            </h1>
                            <p className="text-text-secondary text-sm mt-2 font-light">
                                {t('dashboard.subtitle')}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Settings */}
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-purple-500 hover:border-purple-500/30 shadow-sm hover:shadow transition-all duration-300"
                                title={t('settings.thresholdTitle', 'Cài đặt ngưỡng cảnh báo')}
                            >
                                <Settings className="w-[18px] h-[18px]" />
                            </button>

                            {/* Export */}
                            <button
                                onClick={handleExport}
                                className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-green-500 hover:border-green-500/30 shadow-sm hover:shadow transition-all duration-300"
                                title={t('dashboard.export', 'Xuất báo cáo CSV')}
                            >
                                <Download className="w-[18px] h-[18px]" />
                            </button>

                            {/* Refresh */}
                            <button
                                onClick={handleRefresh}
                                className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 shadow-sm hover:shadow transition-all duration-300"
                                title={t('dashboard.refresh', 'Refresh data')}
                            >
                                <RefreshCw className={`w-[18px] h-[18px] transition-transform duration-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>

                            {/* View toggle */}
                            <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border shadow-sm">
                                <button
                                    onClick={() => setView('grid')}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${view === 'grid'
                                        ? 'bg-primary text-white shadow-[0_2px_8px_rgba(79,106,240,0.35)]'
                                        : 'text-text-muted hover:text-text hover:bg-surface-hover'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    {t('dashboard.grid')}
                                </button>
                                <button
                                    onClick={() => setView('list')}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${view === 'list'
                                        ? 'bg-primary text-white shadow-[0_2px_8px_rgba(79,106,240,0.35)]'
                                        : 'text-text-muted hover:text-text hover:bg-surface-hover'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                    {t('dashboard.list')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
                        {/* Search location */}
                        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-md">
                            <label className="flex items-center gap-2 text-[0.7rem] uppercase tracking-wider text-text-muted font-semibold mb-2">
                                <Search className="w-3.5 h-3.5" />
                                {t('dashboard.search')}
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('dashboard.searchPlaceholder')}
                                className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-text text-sm placeholder:text-text-muted/50 outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        {/* Filter by Line */}
                        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm transition-all duration-200">
                            <CustomSelect
                                label={
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {t('dashboard.area')}
                                    </span>
                                }
                                value={filterLine}
                                onChange={(val) => setFilterLine(val)}
                                options={[
                                    { label: t('dashboard.allAreas'), value: 'all' },
                                    ...lineOptions.map((line) => ({ label: line, value: line })),
                                ]}
                                placeholder={t('dashboard.selectArea')}
                            />
                        </div>

                        {/* Filter by Time */}
                        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm transition-all duration-200">
                            <CustomSelect
                                label={
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        {t('dashboard.update')}
                                    </span>
                                }
                                value={filterTime}
                                onChange={(val) => setFilterTime(val)}
                                options={timeOptions}
                                placeholder={t('dashboard.selectTime')}
                            />
                        </div>

                        {/* Sort */}
                        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm transition-all duration-200">
                            <CustomSelect
                                label={
                                    <span className="flex items-center gap-2">
                                        <ArrowUpDown className="w-3.5 h-3.5" />
                                        {t('dashboard.sort')}
                                    </span>
                                }
                                value={sortBy}
                                onChange={(val) => setSortBy(val)}
                                options={sortOptions}
                                placeholder={t('dashboard.selectSort')}
                            />
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="flex items-center justify-between mb-5 animate-fade-in">
                        <p className="text-text-muted text-sm">
                            {t('dashboard.showing')} <span className="text-text font-semibold">{filteredLocations.length}</span> {t('dashboard.of')} {locations.length} {t('dashboard.locations')}
                        </p>
                        {(search || filterLine !== 'all' || filterTime !== 'all' || sortBy !== 'default') && (
                            <button
                                onClick={() => { setSearch(''); setFilterLine('all'); setFilterTime('all'); setSortBy('default'); }}
                                className="text-xs text-primary hover:text-primary-light transition-colors font-medium"
                            >
                                {t('dashboard.clearFilters')}
                            </button>
                        )}
                    </div>

                    {/* Grid View */}
                    {view === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in">
                            {filteredLocations.length > 0 ? (
                                filteredLocations.map((loc) => (
                                    <LocationCard
                                        key={loc.id}
                                        location={loc.location}
                                        locationId={loc.locationId}
                                        temperature={loc.temperature}
                                        humidity={Math.round(loc.humidity)}
                                        lastUpdate={loc.lastUpdate}
                                        status={loc.status}
                                        onClick={() => handleLocationClick(loc)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <p className="text-text-muted text-lg">{t('dashboard.noSensor')}</p>
                                    <p className="text-text-muted/60 text-sm mt-1">{t('dashboard.tryFilter')}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* List View */}
                    {view === 'list' && (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            {filteredLocations.length > 0 ? (
                                filteredLocations.map((loc) => (
                                    <LocationListItem
                                        key={loc.id}
                                        location={loc.location}
                                        locationId={loc.locationId}
                                        temperature={loc.temperature}
                                        humidity={Math.round(loc.humidity)}
                                        chartData={loc.chartData}
                                        onClick={() => handleLocationClick(loc)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <p className="text-text-muted text-lg">{t('dashboard.noSensor')}</p>
                                    <p className="text-text-muted/60 text-sm mt-1">{t('dashboard.tryFilter')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Location Chart Modal */}
            <LocationChartModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                locationData={selectedLocation}
            />

            {/* Threshold Settings Modal */}
            <ThresholdSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </MainLayout>
    );
};

export default DashboardPage;
