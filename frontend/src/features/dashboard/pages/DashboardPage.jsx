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
  RefreshCw,
  LayoutGrid,
  List,
  Download,
  Settings,
  SearchAlert,
  CircleAlert,
  Building2,
  Factory,
} from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { groupByLocationPrefix } from '../utils/groupUtils';
import { useSettingsStore, useAuthStore } from '../../../store';
import formatRelativeTime from '../utils/timeUtils';

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
  const { user } = useAuthStore();
  const { locations, isLoading, error, fetchLocations, refreshLocations } = useDashboardStore();
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const [view, setView] = useState('grid');
  const [filterFactory, setFilterFactory] = useState(
    () => localStorage.getItem('dashboard_filterFactory') || 'all'
  );
  const [filterType, setFilterType] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(
    () => parseInt(localStorage.getItem('dashboard_refreshInterval'), 10) || 300000
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const allFactoryOptions = ['D1', 'D2', 'V0', 'V1', 'V2', 'V4', 'V5'];

  // Fetch data on mount with saved factory filter
  useEffect(() => {
    fetchLocations('all'); // Always fetch all to allow cross-filtering factories and types
  }, [fetchLocations]);

  // Always fetch latest settings on dashboard load
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        if (!cancelled) {
          await fetchSettings();
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    };

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [fetchSettings]);

  // Extract unique location prefixes for line filter based on selected filterType
  const lineOptions = useMemo(() => {
    let validLocations = locations;

    // Lọc lấy các location khớp với filterType hiện tại
    if (filterType !== 'all') {
      validLocations = validLocations.filter((l) => {
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

    const names = validLocations.map((l) => l.location);
    return [...new Set(names)];
  }, [locations, filterType]);

  // Extract unique location types for type filter (after 2nd underscore)
  const typeOptions = useMemo(() => {
    const validLocations =
      filterFactory === 'all'
        ? locations
        : locations.filter((l) => l.location && l.location.startsWith(filterFactory));
    const types = validLocations
      .map((l) => {
        if (!l.location) return null;
        const parts = l.location.split('_');
        if (parts.length > 2) {
          let typeStr = parts[2].trim().toUpperCase();
          if (typeStr.startsWith('LINE')) return 'LINE';
          if (typeStr.startsWith('WH')) return 'WH';
          return parts[2].trim();
        }
        return null;
      })
      .filter(Boolean);
    return [...new Set(types)];
  }, [locations]);

  // Factory dropdown options should match current "location type" filter.
  // This prevents showing the full factory list when the visible locations are narrowed.
  const factoryOptions = useMemo(() => {
    const validLocations =
      filterType === 'all'
        ? locations
        : locations.filter((l) => {
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

    const availableFactorySet = new Set(
      validLocations
        .map((l) => (l.location ? l.location.split('_')[0]?.trim() : null))
        .filter(Boolean)
    );

    let nextOptions = allFactoryOptions.filter((factory) => availableFactorySet.has(factory));

    // Ensure current selected value is always present for CustomSelect rendering.
    if (filterFactory !== 'all' && filterFactory) {
      if (!nextOptions.includes(filterFactory)) nextOptions = [filterFactory, ...nextOptions];
    }

    return nextOptions;
  }, [locations, filterType, filterFactory]);

  // Handle location card click
  const handleLocationClick = useCallback((location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  }, []);

  // Handle factory filter change - persist to localStorage
  const handleFilterFactoryChange = useCallback(
    (factory) => {
      setFilterFactory(factory);
      localStorage.setItem('dashboard_filterFactory', factory);
      // No need to fetchLocations here since we always fetch 'all' and filter locally
      setFilterType('all');
    },
    []
  );

  // Refresh handler - full re-fetch from API
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchLocations('all');
    setTimeout(() => setIsRefreshing(false), 600);
  }, [fetchLocations]);

  // Auto-refresh based on user-selected interval (persisted in localStorage)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLocations('all');
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
    
    // Filter by factory
    if (filterFactory !== 'all') {
      result = result.filter((l) => l.location && l.location.startsWith(filterFactory));
    }

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

    return result;
  }, [locations, filterFactory, filterType]);

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
      t('dashboard.temperature', 'Nhiệt độ') + ' (°C)',
      t('dashboard.humidity', 'Độ ẩm') + ' (%)',
      t('dashboard.lastUpdate', 'Cập nhật lần cuối'),
      t('dashboard.status', 'Trạng thái'),
    ];

    // Convert filtered data to CSV rows
    const rows = filteredLocations.map((loc) => [
      loc.location,
      loc.temperature,
      Math.round(loc.humidity),
      formatRelativeTime(loc.lastUpdateISO),
      loc.status === 'Normal' ? t('dashboard.normal', 'Normal') : loc.status,
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
        <div className="max-w-[1700px] mx-auto p-4 md:p-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 animate-slide-down">
            {/* ── Left: Filters ── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:w-[70%] 2xl:w-[75%]">
              <div className="w-full sm:flex-1 bg-surface rounded-lg border border-border p-2.5 shadow-sm">
                <CustomSelect
                  label={
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {t('dashboard.locationName', 'Loại khu vực')}
                    </span>
                  }
                  value={filterType}
                  onChange={(val) => setFilterType(val)}
                  options={[
                    { label: t('dashboard.allFactories', 'Tất cả loại'), value: 'all' },
                    ...typeOptions.map((type) => {
                      let label = type;
                      if (type === 'WH') label = t('dashboard.typeWh', 'WAREHOUSE');
                      else if (type === 'PL') label = t('dashboard.typeLine', 'LINE');
                      return { label, value: type };
                    }),
                  ]}
                  placeholder={t('dashboard.selectType', 'Chọn loại')}
                />
              </div>

              <div className="w-full sm:flex-1 bg-surface rounded-lg border border-border p-2.5 shadow-sm">
                <CustomSelect
                  label={
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {t('auth.factory')}
                    </span>
                  }
                  value={filterFactory}
                  onChange={handleFilterFactoryChange}
                  options={[
                    { label: t('dashboard.allFactories'), value: 'all' },
                    ...factoryOptions.map((factory) => ({ label: factory, value: factory })),
                  ]}
                  placeholder={t('dashboard.selectFactory')}
                />
              </div>

              <div className="w-full sm:flex-1 bg-surface rounded-lg border border-border p-2.5 shadow-sm">
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
            </div>

            {/* ── Right: Actions ── */}
            <div className="flex items-center justify-end gap-2 sm:w-[30%] 2xl:w-[25%]">
              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted hover:text-purple-500 hover:border-purple-500/30 shadow-sm hover:shadow transition-all duration-200"
                  title={t('settings.thresholdTitle', 'Cài đặt ngưỡng cảnh báo')}
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleExport}
                className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted hover:text-green-500 hover:border-green-500/30 shadow-sm hover:shadow transition-all duration-200"
                title={t('dashboard.export', 'Xuất báo cáo CSV')}
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleRefresh}
                className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 shadow-sm hover:shadow transition-all duration-200"
                title={t('dashboard.refresh', 'Refresh data')}
              >
                <RefreshCw
                  className={`w-4 h-4 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </button>

              <div className="w-px h-6 bg-border mx-1" />

              <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border shadow-sm">
                <button
                  onClick={() => setView('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    view === 'grid'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  {t('dashboard.grid')}
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    view === 'list'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  {t('dashboard.list')}
                </button>
              </div>
            </div>
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
                  <div
                    key={parentPrefix}
                    className="w-full bg-surface/20 px-3 py-2 rounded-2xl border border-border/60"
                  >
                    {/* Compact Header Nhóm Cha */}
                    <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-border/30">
                      <Factory className="w-6 h-6 text-primary" />
                      <h2 className="text-[24px] font-bold text-text uppercase tracking-wider">
                        {parentPrefix}
                      </h2>
                    </div>

                    {/* Each child group = 1 row */}
                    <div className="flex flex-col gap-3">
                      {childGroups.map((group) => (
                        <LocationGroupSection
                          key={group.prefix}
                          prefix={group.prefix}
                          count={group.items.length}
                        >
                          <div className="flex flex-wrap gap-3 sm:gap-5 mt-2 w-full">
                            {group.items.map((loc) => (
                              <div
                                key={loc.id}
                                className="w-full sm:w-[153px] lg:w-[212px] 2xl:w-[253px] min-w-0 overflow-hidden"
                              >
                                <LocationCard
                                  location={loc.location}
                                  locationId={loc.locationId}
                                  temperature={loc.temperature}
                                  humidity={Math.round(loc.humidity)}
                                  sensorType={loc.sensorType}
                                  lastUpdate={loc.lastUpdate}
                                  lastUpdateISO={loc.lastUpdateISO}
                                  status={loc.status}
                                  tempMin={loc.tempMin}
                                  tempMax={loc.tempMax}
                                  humMin={loc.humMin}
                                  humMax={loc.humMax}
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
                  <div
                    key={parentPrefix}
                    className="w-full bg-surface/20 p-5 rounded-[24px] border border-border/60"
                  >
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
                        <LocationGroupSection
                          key={group.prefix}
                          prefix={group.prefix}
                          count={group.items.length}
                        >
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
                                tempMin={loc.tempMin}
                                tempMax={loc.tempMax}
                                humMin={loc.humMin}
                                humMax={loc.humMax}
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
      <ThresholdSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefresh={handleRefresh}
      />
    </MainLayout>
  );
};

export default DashboardPage;
