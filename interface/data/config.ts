export interface ConfigMMSInterface {
  id?: string | number;
  max_end_hour: string;
  max_mms: number;
  max_mms_per_day: number;
  min_budget: {
    mode: string;
    money: number;
    percent_budget: string;
  };
  min_start_hour: string;
  updated_at: string | number;
}

export interface ConfigNotificationPatternInterface {
  id: string;
  name: string;
  message_pattern: Array<object>;
  icon_pattern: object;
  redirect_pattern: Array<object>;
  alias: Array<object>;
}

export interface ConfigSystemInterface {
  created_at?: string | number;
  display_name?: string;
  id?: string | number;
  name?: string;
  note?: string;
  updated_at?: string | number;
  value?: string;
}
