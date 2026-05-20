import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Upload, Download } from 'lucide-react';

const TranslationList = ({
  translations,
  selectedTranslation,
  onSelectTranslation,
  onImport,
  onExport,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTranslations = useMemo(() => {
    if (!searchTerm.trim()) return translations;
    const term = searchTerm.toLowerCase();
    return translations.filter(
      (item) =>
        item.DESCRIPTION?.toLowerCase().includes(term) ||
        item.VI?.toLowerCase().includes(term) ||
        item.EN?.toLowerCase().includes(term) ||
        item.KR?.toLowerCase().includes(term)
    );
  }, [translations, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-[10px_18px] border-b border-border bg-surface-alt/50 shrink-0">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold">{t('admin.translations', 'Translations')}</h2>

            <p className="text-sm text-text-muted mt-1">
              {t('admin.totalUsers', 'Total')}:{' '}
              <span className="font-semibold text-text">{filteredTranslations.length}</span>
              {searchTerm && translations.length !== filteredTranslations.length && (
                <span className="text-text-muted"> / {translations.length}</span>
              )}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-[320px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('admin.searchTranslation', 'Search key, value...')}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted/50"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-surface hover:bg-surface-hover text-text transition-all duration-200"
            title={t('admin.importTranslations', 'Import')}
          >
            <Upload size={14} />
            {t('admin.import', 'Import')}
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-surface hover:bg-surface-hover text-text transition-all duration-200"
            title={t('admin.exportTranslations', 'Export')}
          >
            <Download size={14} />
            {t('admin.export', 'Export')}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        <table className="w-full text-left border-collapse min-w-[600px]">
          {/* Table Head (Sticky) */}
          <thead className="sticky top-0 bg-surface z-10 shadow-sm border-b border-border">
            <tr>
              <th className="py-4 px-4 text-sm font-semibold text-text-muted uppercase tracking-wider w-[5%]">
                {t('admin.tableNo', 'No')}
              </th>
              <th className="py-4 px-4 text-sm font-semibold text-text-muted uppercase tracking-wider w-[15%]">
                {t('admin.tableKey', 'Key')}
              </th>
              <th className="py-4 px-4 text-sm font-semibold text-text-muted uppercase tracking-wider w-[25%]">
                VI
              </th>
              <th className="py-4 px-4 text-sm font-semibold text-text-muted uppercase tracking-wider w-[25%]">
                EN
              </th>
              <th className="py-4 px-4 text-sm font-semibold text-text-muted uppercase tracking-wider w-[25%]">
                KR
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border">
            {filteredTranslations.length === 0 ? (
              <tr>
                <td colSpan="5" className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-text-muted">
                    <p>{t('admin.noTranslationsFound', 'No translations found')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTranslations.map((item, index) => (
                <tr
                  key={item.ID || item.DESCRIPTION}
                  onClick={() => onSelectTranslation(item)}
                  className={`group transition-colors duration-150 cursor-pointer ${
                    selectedTranslation?.ID === item.ID
                      ? 'bg-primary/5'
                      : 'bg-surface hover:bg-surface-hover'
                  }`}
                >
                  {/* Column: No */}
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-text">{index + 1}</span>
                  </td>
                  {/* Column: Key (description) */}
                  <td className="py-3 px-4" title={item.DESCRIPTION}>
                    <p
                      className={`text-sm font-semibold truncate ${
                        selectedTranslation?.ID === item.ID ? 'text-primary' : 'text-text'
                      }`}
                    >
                      {item.DESCRIPTION}
                    </p>
                  </td>
                  {/* Column: VI */}
                  <td className="py-3 px-4" title={item.VI || ''}>
                    <span className="text-sm text-text truncate block max-w-[200px]">
                      {item.VI || '-'}
                    </span>
                  </td>
                  {/* Column: EN */}
                  <td className="py-3 px-4" title={item.EN || ''}>
                    <span className="text-sm text-text truncate block max-w-[200px]">
                      {item.EN || '-'}
                    </span>
                  </td>
                  {/* Column: KR */}
                  <td className="py-3 px-4" title={item.KR || ''}>
                    <span className="text-sm text-text truncate block max-w-[150px]">
                      {item.KR || '-'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TranslationList;
