import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '../../../components/layout';
import { CustomSelect } from '../../../components/ui';
import api from '../../../services/api';
import {
  LocationCard,
  LocationListItem,
  LocationChartModal,
  ThresholdSettingsModal,
  LocationGroupSection,
} from '../components';
import {
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
  Building2,
  Factory
} from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { groupByLocationPrefix } from '../utils/groupUtils';
import { useSettingsStore } from '../../../store';

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
  const loadFromUser = useSettingsStore((s) => s.loadFromUser);
  const [view, setView] = useState('grid');
  const [filterFactory, setFilterFactory] = useState(
    () => localStorage.getItem('dashboard_filterFactory') || 'all'
  );
  const [filterType, setFilterType] = useState('all');
  const [filterLine, setFilterLine] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(
    () => parseInt(localStorage.getItem('dashboard_refreshInterval'), 10) || 300000
  );
  const [sortBy, setSortBy] = useState('default');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Hardcoded factory options — always visible
  const factoryOptions = ['D2','V0', 'V4', 'V5'];

  // Fetch data on mount with saved factory filter
  useEffect(() => {
    fetchLocations(filterFactory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchLocations]);

  // Always fetch latest user settings on dashboard load
  useEffect(() => {
    let cancelled = false;

    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        const user = res.data?.data?.user;
        if (!cancelled && user) {
          loadFromUser(user);
        }
      } catch (e) {
        // axios interceptor handles 401 (logout). Keep dashboard resilient.
        console.error('Failed to load user settings:', e);
      }
    };

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [loadFromUser]);

  // Extract unique location prefixes for line filter
  const lineOptions = useMemo(() => {
    const names = locations.map((l) => l.location);
    return [...new Set(names)];
  }, [locations]);

  // Extract unique location types for type filter (after 2nd underscore)
  const typeOptions = useMemo(() => {
    const types = locations.map((l) => {
      if (!l.location) return null;
      const parts = l.location.split('_');
      if (parts.length > 2) {
        let typeStr = parts[2].trim().toUpperCase();
        if (typeStr.startsWith('LINE')) return 'LINE';
        if (typeStr.startsWith('WH')) return 'WH';
        return parts[2].trim();
      }
      return null;
    }).filter(Boolean);
    return [...new Set(types)];
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

  // Handle factory filter change - persist to localStorage + re-fetch from API
  const handleFilterFactoryChange = useCallback((factory) => {
    setFilterFactory(factory);
    localStorage.setItem('dashboard_filterFactory', factory);
    fetchLocations(factory);
  }, [fetchLocations]);

  // Refresh handler - full re-fetch from API
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchLocations(filterFactory);
    setTimeout(() => setIsRefreshing(false), 600);
  }, [fetchLocations, filterFactory]);
  
  // Auto-refresh based on user-selected interval (persisted in localStorage)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLocations(filterFactory);
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshLocations, refreshInterval, filterFactory]);

  
  // Persist refresh interval to localStorage
  const handleRefreshIntervalChange = useCallback((val) => {
    const ms = parseInt(val, 10);
    setRefreshInterval(ms);
    localStorage.setItem('dashboard_refreshInterval', String(ms));
  }, []);

  // Filtered + sorted data
  const filteredLocations = useMemo(() => {
    let result = [...locations];
    // Filter by type (after 2nd underscore)
    if (filterType !== 'all') {
      result = result.filter((l) => {
        if (!l.location) return false;
        const parts = l.location.split('_');
        if (parts.length > 2) {
          let typeStr = parts[2].trim().toUpperCase();
          if (typeStr.startsWith('LINE')) typeStr = 'LINE';
          else if (typeStr.startsWith('WH')) typeStr = 'WH';
          else typeStr = parts[2].trim();
          return typeStr === filterType;
        }
        return false;
      });
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
  }, [locations, filterType, filterLine, sortBy]);

  // Group filtered locations by 5-char prefix of tc_name
  const groupedLocations = useMemo(
    () => groupByLocationPrefix(filteredLocations),
    [filteredLocations]
  );

  // THÊM MỚI: Nhóm các group 5 ký tự thành các group lớn 2 ký tự (Nhóm Cha)
  const nestedLocations = useMemo(() => {
    return groupedLocations.reduce((acc, group) => {
      const parentPrefix = group.prefix.substring(0, 2);
      if (!acc[parentPrefix]) {
        acc[parentPrefix] = [];
      }
      acc[parentPrefix].push(group);
      return acc;
    }, {});
  }, [groupedLocations]);

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
        <div className="max-w-[1800px] mx-auto p-4 md:p-2">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 animate-slide-down">
            <div>
              {/* Factory filter tabs — always visible */}
              <div className="flex items-center gap-3 mb-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {t('dashboard.factory')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleFilterFactoryChange('all')}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                        filterFactory === 'all'
                          ? 'bg-primary text-white border-primary shadow-[0_2px_8px_rgba(79,106,240,0.35)]'
                          : 'bg-surface text-text-muted border-border hover:text-text hover:border-primary/30 hover:shadow-sm'
                      }`}
                    >
                      {t('dashboard.allFactories')}
                    </button>
                    {factoryOptions.map((factory) => (
                      <button
                        key={factory}
                        onClick={() => handleFilterFactoryChange(factory)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold font-mono transition-all duration-300 border ${
                          filterFactory === factory
                            ? 'bg-primary text-white border-primary shadow-[0_2px_8px_rgba(79,106,240,0.35)]'
                            : 'bg-surface text-text-muted border-border hover:text-text hover:border-primary/30 hover:shadow-sm'
                        }`}
                      >
                        {factory}
                      </button>
                    ))}
                  </div>
              </div>
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
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-2 animate-fade-in">
            {/* Filter by Type */}
            <div className="bg-surface rounded-lg border border-border p-2.5 shadow-sm transition-all duration-200">
              <CustomSelect
                label={
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {t('dashboard.type', 'Loại khu vực')}
                  </span>
                }
                value={filterType}
                onChange={(val) => setFilterType(val)}
                options={[
                  { label: t('dashboard.allTypes', 'Tất cả loại'), value: 'all' },
                  ...typeOptions.map((type) => {
                    let label = type;
                    if (type === 'WH') label = t('dashboard.typeWh', 'Warehouse');
                    else if (type === 'LINE') label = t('dashboard.typeLine', 'Line');
                    return { label, value: type };
                  }),
                ]}
                placeholder={t('dashboard.selectType', 'Chọn loại')}
              />
            </div>

            {/* Filter by Line */}
            <div className="bg-surface rounded-lg border border-border p-2.5 shadow-sm transition-all duration-200">
              <CustomSelect
                label={
                  <span className="flex items-center gap-1.5">
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
            <div className="bg-surface rounded-lg border border-border p-2.5 shadow-sm transition-all duration-200">
              <CustomSelect
                label={
                  <span className="flex items-center gap-1.5">
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
            <div className="bg-surface rounded-lg border border-border p-2.5 shadow-sm transition-all duration-200">
              <CustomSelect
                label={
                  <span className="flex items-center gap-1.5">
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
          <div className="flex items-center justify-between mb-2 animate-fade-in">
            <p className="text-text-muted text-sm">
              {t('dashboard.showing')}{' '}
              <span className="text-text font-semibold">{filteredLocations.length}</span>{' '}
              {t('dashboard.of')} {locations.length} {t('dashboard.locations')}
            </p>
            {(filterFactory !== 'all' || filterType !== 'all' || filterLine !== 'all' || sortBy !== 'default') && (
              <button
                onClick={() => {
                  handleFilterFactoryChange('all');
                  setFilterType('all');
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
            <div key="grid-view" className="flex flex-col gap-2 animate-fade-in w-full">
              {Object.keys(nestedLocations).length > 0 ? (
                Object.entries(nestedLocations).map(([parentPrefix, childGroups]) => (
                  <div key={parentPrefix} className="w-full bg-surface/20 px-3 py-2 rounded-2xl border border-border/60">
                    {/* Compact Header Nhóm Cha */}
                    <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-border/30">
                      <Factory className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-bold text-text uppercase tracking-wider">
                        {parentPrefix}
                      </h2>
                    </div>

                    {/* Each child group = 1 row */}
                    <div className="flex flex-col gap-3">
                      {childGroups.map((group) => (
                        <LocationGroupSection key={group.prefix} prefix={group.prefix} count={group.items.length}>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {group.items.map((loc) => (
                              <div key={loc.id} className="w-[143px]">
                                <LocationCard
                                  location={loc.location}
                                  locationId={loc.locationId}
                                  temperature={loc.temperature}
                                  humidity={Math.round(loc.humidity)}
                                  sensorType={loc.sensorType}
                                  lastUpdate={loc.lastUpdate}
                                  lastUpdateISO={loc.lastUpdateISO}
                                  status={loc.status}
                                  onClick={() => handleLocationClick(loc)}
                                />
                              </div>
                            ))}
                          </div>
                        </LocationGroupSection>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 w-full">
                  <SearchAlert className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted text-lg">{t('dashboard.noSensor')}</p>
                  <p className="text-text-muted/60 text-sm mt-1">{t('dashboard.tryFilter')}</p>
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {!isLoading && !error && view === 'list' && (
            <div className="flex flex-col gap-5 animate-fade-in w-full">
              {Object.keys(nestedLocations).length > 0 ? (
                Object.entries(nestedLocations).map(([parentPrefix, childGroups]) => (
                  <div key={parentPrefix} className="w-full bg-surface/20 p-5 rounded-[24px] border border-border/60">
                    {/* Header Nhóm Cha */}
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/40">
                      <Factory className="w-6 h-6 text-primary" />
                      <h2 className="text-xl font-bold text-text uppercase tracking-wider">
                        {parentPrefix}
                      </h2>
                    </div>

                    {/* Lưới Nhóm Con (List) */}
                    <div className="flex flex-col gap-6">
                      {childGroups.map((group) => (
                        <LocationGroupSection key={group.prefix} prefix={group.prefix} count={group.items.length}>
                          <div className="flex flex-col gap-4 mt-2">
                            {group.items.map((loc) => (
                              <LocationListItem
                                key={loc.id}
                                location={loc.location}
                                locationId={loc.locationId}
                                temperature={loc.temperature}
                                humidity={Math.round(loc.humidity)}
                                sensorType={loc.sensorType}
                                lastUpdate={loc.lastUpdate}
                                lastUpdateISO={loc.lastUpdateISO}
                                chartData={loc.chartData}
                                onClick={() => handleLocationClick(loc)}
                              />
                            ))}
                          </div>
                        </LocationGroupSection>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 w-full">
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
