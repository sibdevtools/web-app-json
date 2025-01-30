import { Settings } from './types';
import { getDefaultSettings } from './defaults';

export const loadSettings = (): Settings => {
  const defaultSettings = getDefaultSettings();
  const storedSettings = localStorage.getItem('web-app-settings');

  if (!storedSettings) {
    return defaultSettings;
  }
  try {
    const parsedSettings = JSON.parse(storedSettings);
    return { ...defaultSettings, ...parsedSettings };
  } catch (e) {
    console.error('Error parsing localStorage settings:', e);
    return defaultSettings;
  }
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem('web-app-settings', JSON.stringify(settings));
};
