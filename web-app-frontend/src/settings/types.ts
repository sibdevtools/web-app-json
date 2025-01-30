export type SettingType = 'text' | 'select'

export interface Setting {
  key: string;
  label: string;
  type: SettingType;
  value: string;
}

export interface SelectOption {
  label: string
  value: string
}

export interface SelectSetting extends Setting {
  type: 'select';
  options: SelectOption[];
}

export interface Settings {
  [key: string]: Setting;
}
