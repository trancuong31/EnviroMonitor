import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '../../../components/layout';
import { CustomSelect } from '../../../components/ui';
import {
  LocationCard,
  LocationListItem,
  LocationChartModal,
  ThresholdSettingsModal,
  LocationGroupSection,
} from '../components';
import {
  Search,
  MapPin,
  Clock,
  ArrowUpDown,
  RefreshCw,
  LayoutGrid,
  List,
  Download,
  Settings,
  SearchAlert,
  CircleAlert,
} from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { groupByLocationPrefix } from '../utils/groupUtils';

// Calculate age in minutes from ISO timestamp (used for sorting/filtering)
const getAgeInMinutes = (isoDate) => {
  if (!isoDate) return Infinity;
  return (Date.now() - new Date(isoDate).getTime()) / 60000;
};

/**
 * Factory Location Dashboard page - monitors temperature & humidity
 */
const DashboardPage = () => {
  const { t } = useTranslation();
  const { locations, isLoading, error, fetchLocations, refreshLocations } = useDashboardStore();
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [filterLine, setFilterLine] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(
    () => parseInt(localStorage.getItem('dashboard_refreshInterval'), 10) || 300000
  );
  const [sortBy, setSortBy] = useState('default');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Extract unique location prefixes for line filter
  const lineOptions = useMemo(() => {
    const names = locations.map((l) => {
      return l.location;
    });
    return [...new Set(names)];
  }, [locations]);

  // Handle location card click
  const handleLocationClick = useCallback((location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  }, []);

  // Refresh handler - full re-fetch from API
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchLocations();
    setTimeout(() => setIsRefreshing(false), 600);
  }, [fetchLocations]);
  
  // Auto-refresh based on user-selected interval (persisted in localStorage)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLocations();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshLocations, refreshInterval]);

  // Persist refresh interval to localStorage
  const handleRefreshIntervalChange = useCallback((val) => {
    const ms = parseInt(val, 10);
    setRefreshInterval(ms);
    localStorage.setItem('dashboard_refreshInterval', String(ms));
  }, []);

  // Filtered + sorted data
  const filteredLocations = useMemo(() => {
    let result = [...locations];

    // Search by location text
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.location.toLowerCase().includes(q) || l.locationId.toLowerCase().includes(q)
      );
    }

    // Filter by line (prefix match on tc_name)
    if (filterLine !== 'all') {
      result = result.filter((l) => l.location.startsWith(filterLine));
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
        result.sort((a, b) => getAgeInMinutes(a.lastUpdateISO) - getAgeInMinutes(b.lastUpdateISO));
        break;
      default:
        break;
    }

    return result;
  }, [locations, search, filterLine, sortBy]);

  // Group filtered locations by 5-char prefix of tc_name
  const groupedLocations = useMemo(
    () => groupByLocationPrefix(filteredLocations),
    [filteredLocations]
  );

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
      t('dashboard.status', 'Trạng thái'),
    ];

    // Convert filtered data to CSV rows
    const rows = filteredLocations.map((loc) => [
      loc.location,
      loc.locationId,
      loc.temperature,
      Math.round(loc.humidity),
      loc.lastUpdate,
      loc.status,
    ]);

    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const csvContent =
      BOM +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join(
        '\n'
      );

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `temperature-humidity-report-${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [filteredLocations, t]);

  // Translated options (must be inside component to react to language changes)
  const refreshIntervalOptions = useMemo(
    () => [
      { label: t('dashboard.interval5'), value: '300000' },
      { label: t('dashboard.interval10'), value: '600000' },
      { label: t('dashboard.interval15'), value: '900000' },
    ],
    [t]
  );

  const sortOptions = useMemo(
    () => [
      { label: t('dashboard.sortDefault'), value: 'default' },
      { label: t('dashboard.sortTempAsc'), value: 'temp-asc' },
      { label: t('dashboard.sortTempDesc'), value: 'temp-desc' },
      { label: t('dashboard.sortHumAsc'), value: 'hum-asc' },
      { label: t('dashboard.sortHumDesc'), value: 'hum-desc' },
      { label: t('dashboard.sortRecent'), value: 'recent' },
    ],
    [t]
  );

  return (
    <MainLayout>
      <div className="min-h-full overflow-hidden">
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
                <RefreshCw
                  className={`w-[18px] h-[18px] transition-transform duration-600 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </button>

              {/* View toggle */}
              <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border shadow-sm">
                <button
                  onClick={() => setView('grid')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    view === 'grid'
                      ? 'bg-primary text-white shadow-[0_2px_8px_rgba(79,106,240,0.35)]'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  {t('dashboard.grid')}
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    view === 'list'
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
            <div className="bg-surface rounded-xl border border-border p-4 shadow-sm transition-all duration-200 ">
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

            {/* Refresh Interval */}
            <div className="bg-surface rounded-xl border border-border p-4 shadow-sm transition-all duration-200">
              <CustomSelect
                label={
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {t('dashboard.refreshInterval')}
                  </span>
                }
                value={String(refreshInterval)}
                onChange={handleRefreshIntervalChange}
                options={refreshIntervalOptions}
                placeholder={t('dashboard.selectInterval')}
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
              {t('dashboard.showing')}{' '}
              <span className="text-text font-semibold">{filteredLocations.length}</span>{' '}
              {t('dashboard.of')} {locations.length} {t('dashboard.locations')}
            </p>
            {(search || filterLine !== 'all' || sortBy !== 'default') && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterLine('all');
                  setSortBy('default');
                }}
                className="text-xs text-primary hover:text-primary-light transition-colors font-medium"
              >
                {t('dashboard.clearFilters')}
              </button>
            )}
          </div>

          {/* Loading state */}
          {isLoading && locations.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-text-muted text-lg">
                {t('dashboard.loading', 'Đang tải dữ liệu...')}
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-16 animate-fade-in">
              <CircleAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 text-lg">{t('dashboard.error', 'Lỗi khi tải dữ liệu')}</p>
              <p className="text-text-muted text-sm mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {t('dashboard.retry', 'Thử lại')}
              </button>
            </div>
          )}

          {/* Grid View */}
          {!isLoading && !error && view === 'grid' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              {groupedLocations.length > 0 ? (
                groupedLocations.map((group) => (
                  <LocationGroupSection key={group.prefix} prefix={group.prefix} count={group.items.length}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-14">
                      {group.items.map((loc) => (
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
                      ))}
                    </div>
                  </LocationGroupSection>
                ))
              ) : (
                <div className="text-center py-16">
                  <SearchAlert className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted text-lg">{t('dashboard.noSensor')}</p>
                  <p className="text-text-muted/60 text-sm mt-1">{t('dashboard.tryFilter')}</p>
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {!isLoading && !error && view === 'list' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              {groupedLocations.length > 0 ? (
                groupedLocations.map((group) => (
                  <LocationGroupSection key={group.prefix} prefix={group.prefix} count={group.items.length}>
                    <div className="flex flex-col gap-4">
                      {group.items.map((loc) => (
                        <LocationListItem
                          key={loc.id}
                          location={loc.location}
                          locationId={loc.locationId}
                          temperature={loc.temperature}
                          humidity={Math.round(loc.humidity)}
                          chartData={loc.chartData}
                          onClick={() => handleLocationClick(loc)}
                        />
                      ))}
                    </div>
                  </LocationGroupSection>
                ))
              ) : (
                <div className="text-center py-16">
                  <SearchAlert className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted text-lg">{t('dashboard.noSensor')}</p>
                  <p className="text-text-muted/60 text-sm mt-1">{t('dashboard.tryFilter')}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="fixed bottom-4 right-4 text-xs text-gray-400 opacity-70 tracking-wide select-none">
          {t('home.features.copyright')}
        </div>
      </div>

      {/* Location Chart Modal */}
      <LocationChartModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        locationData={selectedLocation}
      />

      {/* Threshold Settings Modal */}
      <ThresholdSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </MainLayout>
  );
};

export default DashboardPage;
