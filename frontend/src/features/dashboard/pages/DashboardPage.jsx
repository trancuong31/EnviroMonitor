import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '../../../components/layout';
import { CustomSelect } from '../../../components/ui';
import { SensorCard, SensorListItem } from '../components';

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
  { id: 'LOC-A1-01', sensorIds: 'TMP-A1-01 • HUM-A1-01', location: 'Line A - Khu gia công - Tầng 1', temperature: 26.2, humidity: 63, lastUpdate: '1 phút trước', status: 'Normal', chartData: randChart() },
  { id: 'LOC-A1-02', sensorIds: 'TMP-A1-02 • HUM-A1-02', location: 'Line A - Khu lắp ráp - Tầng 1', temperature: 27.5, humidity: 65, lastUpdate: '2 phút trước', status: 'Warm', chartData: randChart() },

  { id: 'LOC-A2-01', sensorIds: 'TMP-A2-01 • HUM-A2-01', location: 'Line A - Khu QC - Tầng 2', temperature: 24.0, humidity: 55, lastUpdate: '3 phút trước', status: 'Normal', chartData: randChart() },
  { id: 'LOC-A2-02', sensorIds: 'TMP-A2-02 • HUM-A2-02', location: 'Line A - Phòng kỹ thuật - Tầng 2', temperature: 23.5, humidity: 52, lastUpdate: '1 phút trước', status: 'Normal', chartData: randChart() },

  { id: 'LOC-A3-01', sensorIds: 'TMP-A3-01 • HUM-A3-01', location: 'Line A - Kho bán thành phẩm - Tầng 3', temperature: 22.8, humidity: 60, lastUpdate: '4 phút trước', status: 'Normal', chartData: randChart() },

  // ===== LINE B =====
  { id: 'LOC-B1-01', sensorIds: 'TMP-B1-01 • HUM-B1-01', location: 'Line B - Khu ép nhựa - Tầng 1', temperature: 29.8, humidity: 70, lastUpdate: '1 phút trước', status: 'Hot', chartData: randChart() },
  { id: 'LOC-B1-02', sensorIds: 'TMP-B1-02 • HUM-B1-02', location: 'Line B - Khu đóng gói - Tầng 1', temperature: 26.0, humidity: 62, lastUpdate: '2 phút trước', status: 'Normal', chartData: randChart() },

  { id: 'LOC-B2-01', sensorIds: 'TMP-B2-01 • HUM-B2-01', location: 'Line B - Phòng kiểm tra chất lượng - Tầng 2', temperature: 24.5, humidity: 58, lastUpdate: '3 phút trước', status: 'Normal', chartData: randChart() },

  { id: 'LOC-B3-01', sensorIds: 'TMP-B3-01 • HUM-B3-01', location: 'Line B - Kho thành phẩm - Tầng 3', temperature: 21.5, humidity: 65, lastUpdate: '5 phút trước', status: 'High Humidity', chartData: randChart() },

  // ===== LINE C =====
  { id: 'LOC-C1-01', sensorIds: 'TMP-C1-01 • HUM-C1-01', location: 'Line C - Khu hàn - Tầng 1', temperature: 31.2, humidity: 68, lastUpdate: '1 phút trước', status: 'Hot', chartData: randChart() },
  { id: 'LOC-C1-02', sensorIds: 'TMP-C1-02 • HUM-C1-02', location: 'Line C - Khu bảo trì - Tầng 1', temperature: 28.0, humidity: 60, lastUpdate: '2 phút trước', status: 'Warm', chartData: randChart() },

  { id: 'LOC-C2-01', sensorIds: 'TMP-C2-01 • HUM-C2-01', location: 'Line C - Phòng điều khiển - Tầng 2', temperature: 22.0, humidity: 50, lastUpdate: '30 giây trước', status: 'Cool', chartData: randChart() },

  { id: 'LOC-C3-01', sensorIds: 'TMP-C3-01 • HUM-C3-01', location: 'Line C - Kho linh kiện - Tầng 3', temperature: 23.3, humidity: 67, lastUpdate: '4 phút trước', status: 'High Humidity', chartData: randChart() },
];

// Extract unique lines from locations
const lineOptions = [...new Set(initialLocations.map((l) => l.location.split(' - ')[0]))];

/**
 * IoT Sensor Dashboard page
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
            result = result.filter((l) => l.location.toLowerCase().includes(q) || l.sensorIds.toLowerCase().includes(q));
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
                            {/* Refresh */}
                            <button
                                onClick={handleRefresh}
                                className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 shadow-sm hover:shadow transition-all duration-300"
                                title="Refresh data"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`w-[18px] h-[18px] transition-transform duration-600 ${isRefreshing ? 'animate-spin' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.93 9a8 8 0 0113.14 0M19.07 15a8 8 0 01-13.14 0" />
                                </svg>
                            </button>

                            {/* View toggle */}
                            <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border shadow-sm">
                                <button
                                    onClick={() => setView('grid')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                        view === 'grid'
                                            ? 'bg-primary text-white shadow-[0_2px_8px_rgba(79,106,240,0.35)]'
                                            : 'text-text-muted hover:text-text hover:bg-gray-100'
                                    }`}
                                >
                                    {t('dashboard.grid')}
                                </button>
                                <button
                                    onClick={() => setView('list')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                        view === 'list'
                                            ? 'bg-primary text-white shadow-[0_2px_8px_rgba(79,106,240,0.35)]'
                                            : 'text-text-muted hover:text-text hover:bg-gray-100'
                                    }`}
                                >
                                    {t('dashboard.list')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
                        {/* Search location */}
                        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-md">
                            <label className="block text-[0.7rem] uppercase tracking-wider text-text-muted font-semibold mb-2">
                                {t('dashboard.search')}
                            </label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('dashboard.searchPlaceholder')}
                                    className="w-full bg-transparent border-none outline-none text-text text-sm pl-6 placeholder:text-text-muted/50"
                                />
                            </div>
                        </div>

                        {/* Filter by Line */}
                        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm transition-all duration-200">
                            <CustomSelect
                                label={t('dashboard.area')}
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
                                label={t('dashboard.update')}
                                value={filterTime}
                                onChange={(val) => setFilterTime(val)}
                                options={timeOptions}
                                placeholder={t('dashboard.selectTime')}
                            />
                        </div>

                        {/* Sort */}
                        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm transition-all duration-200">
                            <CustomSelect
                                label={t('dashboard.sort')}
                                value={sortBy}
                                onChange={(val) => setSortBy(val)}
                                options={sortOptions}
                                placeholder={t('dashboard.selectSort')}
                            />
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="flex items-center justify-between mb-5">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                            {filteredLocations.length > 0 ? (
                                filteredLocations.map((loc) => (
                                    <SensorCard
                                        key={loc.id}
                                        location={loc.location}
                                        sensorIds={loc.sensorIds}
                                        temperature={loc.temperature}
                                        humidity={Math.round(loc.humidity)}
                                        lastUpdate={loc.lastUpdate}
                                        status={loc.status}
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
                                    <SensorListItem
                                        key={loc.id}
                                        location={loc.location}
                                        sensorIds={loc.sensorIds}
                                        temperature={loc.temperature}
                                        humidity={Math.round(loc.humidity)}
                                        chartData={loc.chartData}
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
        </MainLayout>
    );
};

export default DashboardPage;
