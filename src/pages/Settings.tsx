import React, { useEffect } from 'react';
import { useStore, UserSettings } from '../store';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Select from '@radix-ui/react-select';
import { clsx } from 'clsx';

export const Settings: React.FC = () => {
  const { settings, setSettings } = useStore();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Load settings from electron store on mount
    window.electron.getSettings().then((savedSettings) => {
      if (savedSettings && Object.keys(savedSettings).length > 0) {
        setSettings(savedSettings);
        // Only change language if it's different from current
        if (savedSettings.language && savedSettings.language !== i18n.language) {
          i18n.changeLanguage(savedSettings.language);
        }
      }
    });
  }, []); // Remove dependencies to run only once on mount

  const handleChange = React.useCallback((key: keyof UserSettings, value: any) => {
    setSettings({ [key]: value });
    if (key === 'language') {
      i18n.changeLanguage(value);
      // Immediately save language preference to avoid reset on reload
      window.electron.saveSettings({ ...settings, language: value });
    } else {
      // Auto-save other settings immediately
      window.electron.saveSettings({ ...settings, [key]: value });
    }
  }, [settings, setSettings, i18n]);

  const handleFilterChange = (type: 'include' | 'exclude', value: string) => {
    const filters = value.split(',').map(s => s.trim()).filter(Boolean);
    const newSettings = {
      ...settings,
      fileFilters: {
        ...settings.fileFilters,
        [type]: filters
      }
    };
    setSettings(newSettings);
    // Auto-save filters
    window.electron.saveSettings(newSettings);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between drag-region pt-12 px-6 pb-6">
        <div className="select-none">
          <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-gray-500 mt-1">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-6 px-6 pb-6">
        {/* General Settings */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('settings.general')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">{t('settings.autoStart')}</label>
                <p className="text-sm text-gray-500">{t('settings.autoStartDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={(e) => handleChange('autoStart', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-checked:bg-cyan-600 rounded-full transition-colors duration-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/20"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <label className="font-medium text-gray-700">{t('settings.minimizeToTray')}</label>
                <p className="text-sm text-gray-500">{t('settings.minimizeToTrayDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.minimizeToTray}
                  onChange={(e) => handleChange('minimizeToTray', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-checked:bg-cyan-600 rounded-full transition-colors duration-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/20"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5"></div>
              </label>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <label className="font-medium text-gray-700">{t('settings.showNotifications')}</label>
                <p className="text-sm text-gray-500">{t('settings.showNotificationsDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.showNotifications}
                  onChange={(e) => handleChange('showNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-checked:bg-cyan-600 rounded-full transition-colors duration-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/20"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <label className="font-medium text-gray-700">{t('settings.language')}</label>
                <p className="text-sm text-gray-500">{t('settings.languageDesc')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select.Root 
                  value={i18n.language} 
                  onValueChange={(value) => handleChange('language', value)}
                >
                  <Select.Trigger className="input w-[180px] flex items-center justify-between outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500">
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-gray-400" />
                      <Select.Value />
                    </div>
                    <Select.Icon>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content className="overflow-hidden bg-white rounded-lg shadow-lg border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <Select.Viewport className="p-1">
                        <Select.Item value="en" className="relative flex items-center h-9 px-8 rounded hover:bg-slate-50 text-sm text-slate-700 cursor-pointer outline-none select-none data-[highlighted]:bg-cyan-50 data-[highlighted]:text-cyan-900">
                          <Select.ItemText>English</Select.ItemText>
                          <Select.ItemIndicator className="absolute left-2 inline-flex items-center justify-center">
                            <Check className="w-4 h-4 text-cyan-600" />
                          </Select.ItemIndicator>
                        </Select.Item>
                        <Select.Item value="zh" className="relative flex items-center h-9 px-8 rounded hover:bg-slate-50 text-sm text-slate-700 cursor-pointer outline-none select-none data-[highlighted]:bg-cyan-50 data-[highlighted]:text-cyan-900">
                          <Select.ItemText>中文 (简体)</Select.ItemText>
                          <Select.ItemIndicator className="absolute left-2 inline-flex items-center justify-center">
                            <Check className="w-4 h-4 text-cyan-600" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
          </div>
        </section>

        {/* Sync Rules */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('settings.syncRules')}</h2>
          <div className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">{t('settings.deleteOnSync')}</label>
              <p className="text-sm text-gray-500 mb-3">{t('settings.deleteOnSyncDesc')}</p>
              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input
                     type="radio"
                     checked={settings.deleteOnSync}
                     onChange={() => handleChange('deleteOnSync', true)}
                     className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                   />
                   <span>{t('settings.enabled')}</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input
                     type="radio"
                     checked={!settings.deleteOnSync}
                     onChange={() => handleChange('deleteOnSync', false)}
                     className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                   />
                   <span>{t('settings.disabled')}</span>
                 </label>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block font-medium text-gray-700 mb-1">{t('settings.excludeFiles')}</label>
              <p className="text-sm text-gray-500 mb-2">{t('settings.excludeFilesDesc')}</p>
              <input
                type="text"
                value={settings.fileFilters.exclude.join(', ')}
                onChange={(e) => handleFilterChange('exclude', e.target.value)}
                placeholder=".tmp, .log"
                className="input"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
