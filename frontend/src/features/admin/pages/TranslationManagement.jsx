import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Navigate, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../../../services/api';
import { useAuthStore } from '../../../store';
import TranslationList from '../components/TranslationList';
import TranslationEditor from '../components/TranslationEditor';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout/MainLayout';

const TranslationManagement = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const importInputRef = useRef(null);

  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/translations');
      setTranslations(res.data?.data?.allTranslations || []);
    } catch (error) {
      console.error('Error fetching translations:', error);
      toast.error(t('dashboard.error', 'Error loading data'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (['Admin', 'Manager'].includes(currentUser?.role)) {
      fetchTranslations();
    }
  }, [currentUser, fetchTranslations]);

  // Redirect if not admin
  if (!['Admin', 'Manager'].includes(currentUser?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSelectTranslation = (item) => {
    setSelectedTranslation(item);
  };

  /** Single update — PUT /translations */
  const handleSaveTranslation = async (formData) => {
    try {
      if (
        selectedTranslation &&
        selectedTranslation.VI === formData.vi &&
        selectedTranslation.EN === formData.en &&
        selectedTranslation.KR === formData.kr
      ) {
        toast.warning(t('settings.noChange', 'No changes made'));
        return;
      }

      await api.put('/translations', {
        description: formData.description,
        vi: formData.vi,
        en: formData.en,
        kr: formData.kr,
        eventUser: currentUser?.id,
      });

      toast.success(t('admin.translationUpdatedSuccess', 'Translation updated successfully'));

      // Update local state
      setTranslations((prev) =>
        prev.map((item) =>
          item.ID === selectedTranslation.ID
            ? { ...item, VI: formData.vi, EN: formData.en, KR: formData.kr }
            : item
        )
      );
      //reset form
      setSelectedTranslation(null);

      // Reload translations for the UI
      import('../../../i18n').then(({ refreshCurrentTranslations }) => {
        refreshCurrentTranslations({ force: true }).catch(console.error);
      });
    } catch (error) {
      console.error('Error updating translation:', error);
      const msg = error.response?.data?.message || t('admin.errorOccurred', 'An error occurred');
      toast.error(msg);
    }
  };

  /** Export to Excel (.xlsx) */
  const handleExport = () => {
    try {
      const exportData = translations.map(({ ID, DESCRIPTION, VI, EN, KR }) => ({
        ID,
        DESCRIPTION,
        VI: VI || '',
        EN: EN || '',
        KR: KR || '',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = [
        { wch: 6 }, // ID
        { wch: 50 }, // DESCRIPTION
        { wch: 40 }, // VI
        { wch: 40 }, // EN
        { wch: 40 }, // KR
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Translations');
      XLSX.writeFile(wb, `translations_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Error exporting translations:', error);
      toast.error(t('admin.exportError', 'Error exporting translations'));
    }
  };

  const handleImport = () => {
    importInputRef.current?.click();
  };

  /** Import from Excel (.xlsx) — PUT /translations/bulk */
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedData = XLSX.utils.sheet_to_json(sheet);

      if (!Array.isArray(importedData) || importedData.length === 0) {
        toast.error(t('admin.importInvalidFormat', 'Invalid file format'));
        return;
      }

      // Each row must have ID and at least one language value
      const valid = importedData.every(
        (item) =>
          item.ID && (item.VI !== undefined || item.EN !== undefined || item.KR !== undefined)
      );
      if (!valid) {
        toast.error(t('admin.importInvalidData'));
        return;
      }

      // check duplidate DESCRIPTION
      const descriptions = importedData.map((item) => item.DESCRIPTION);
      const uniqueDescriptions = new Set(descriptions);
      // get list row index duplidcate
      const duplicateRowIndices = descriptions
        .map((item, index) => (descriptions.indexOf(item) !== index ? index + 2 : null))
        .filter(Boolean);

      if (descriptions.length !== uniqueDescriptions.size) {
        toast.error(t('admin.duplicateKey') + ': ' + duplicateRowIndices.join(', '));
        return;
      }

      const bulkData = importedData.map(({ DESCRIPTION, VI, EN, KR }) => ({
        description: DESCRIPTION,
        vi: VI ?? '',
        en: EN ?? '',
        kr: KR ?? '',
      }));

      await api.put('/translations/bulk', { translations: bulkData, eventUser: currentUser?.id });
      await fetchTranslations();
      setSelectedTranslation(null);

      // Reload translations for the UI
      import('../../../i18n').then(({ refreshCurrentTranslations }) => {
        refreshCurrentTranslations({ force: true }).catch(console.error);
      });

      toast.success(t('admin.importSuccess', 'Translations imported successfully'));
    } catch (error) {
      console.error('Error importing translations:', error);
      const msg =
        error.response?.data?.message || t('admin.importError', 'Error importing translations');
      toast.error(msg);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <MainLayout>
      <div className="px-6 md:px-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col pt-2 pb-6 w-full">
        {/* Header Section */}
        <div className="mb-3 flex flex-row items-start sm:items-center gap-4 animate-slide-down">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/80 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
              {t('admin.translationManagement', 'Translation Management')}
            </h1>
            <p className="text-text-muted mt-0.5 text-sm">
              {t('admin.translationManagementDesc', 'Manage multilingual translation keys')}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden animate-fade-in delay-100">
          {/* Left Panel: Translation List */}
          <div className="transition-all duration-500 ease-in-out h-full flex flex-col lg:w-[65%] lg:pr-6">
            {loading ? (
              <div className="flex items-center justify-center h-full bg-surface rounded-2xl border border-border shadow-sm">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-text-muted font-medium">
                    {t('dashboard.loading', 'Loading data...')}
                  </p>
                </div>
              </div>
            ) : (
              <TranslationList
                translations={translations}
                selectedTranslation={selectedTranslation}
                onSelectTranslation={handleSelectTranslation}
                onImport={handleImport}
                onExport={handleExport}
              />
            )}
          </div>

          {/* Right Panel: Editor */}
          <div className="absolute lg:relative right-0 top-0 h-full bg-background z-10 lg:z-auto transition-all duration-500 ease-in-out w-full lg:w-[35%] translate-x-0 opacity-100 visibility-visible">
            <div className="w-full h-full lg:min-w-[340px] lg:pl-2">
              <TranslationEditor
                key={`translation-editor-${selectedTranslation?.ID || 'none'}`}
                translation={selectedTranslation}
                onSave={handleSaveTranslation}
              />
            </div>
          </div>
        </div>

        {/* Hidden file input for import */}
        <input
          ref={importInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>
    </MainLayout>
  );
};

export default TranslationManagement;
