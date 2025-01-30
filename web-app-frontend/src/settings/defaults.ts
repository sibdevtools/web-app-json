import { SelectSetting, Settings } from './types';

export const getDefaultSettings = (): Settings => {
  return {
    aceTheme: {
      key: 'aceTheme',
      label: 'Ace theme',
      type: 'select',
      value: 'monokai',
      options: [
        {
          value: 'monokai',
          label: 'Monokai',
        },
        {
          value: 'github',
          label: 'GitHub',
        },
        {
          value: 'tomorrow',
          label: 'Tomorrow',
        },
        {
          value: 'kuroir',
          label: 'Kuroir',
        },
        {
          value: 'twilight',
          label: 'Twilight',
        },
        {
          value: 'xcode',
          label: 'XCode',
        },
        {
          value: 'textmate',
          label: 'TextMate',
        },
        {
          value: 'solarized_dark',
          label: 'Solarized Dark',
        },
        {
          value: 'solarized_light',
          label: 'Solarized Light',
        },
        {
          value: 'terminal',
          label: 'Terminal',
        },
      ],
    } as SelectSetting,
  };
};
