import { CampaignInterface } from "~/interface/data/campaign";
import { BrandnameInterface } from "~/interface/data/brandname";
import { ChannelInterface } from "~/interface/data/channel";

export interface SummaryMMSInterface {
  budget: number;
  expense: number;
  remain_budget: number;
}

export interface SummaryRedirectInterface {
  budget: number;
  expense: number;
  remain_budget: number;
}

export interface SliderDataInterface {
  min: number;
  max: number;
  code?: string;
  name?: string;
}

export interface ItemTargetingInterface {
  id: string | number;
  code: string;
  name: string;
}

export interface EventTrackingInterface {
  id: string | number;
  name: string;
  pivot: {
    ads_id: string | number;
    event_tracking_id: string | number;
    value: number;
  };
}

export interface GroupAgeInterface {
  id: string | number;
  name: string;
  code: string;
  min_age: number;
  max_age: number;
}

export interface BannerRedirectInterface {
  ads_id?: string | number;
  ads_type_id?: string | number;
  advertiser_id?: string | number;
  agency_id?: string | number;
  budget?: number;
  budget_mode?: string;
  campaign?: CampaignInterface;
  campaign_id?: string | number;
  campaign_name?: string;
  created_at?: string | number;
  ctr?: number;
  end_time?: string | number;
  expense?: number;
  id?: number;
  item_permissions?: Array<string>;
  max_view?: number;
  max_click?: number;
  max_view_per_day?: number;
  max_click_per_day?: number;
  name?: string;
  newCampaign?: CampaignInterface;
  typeCampaign?: string;
  num_click?: number;
  num_skip?: number;
  num_view?: number;
  threshold_obj?: {
    threshold?: number;
  };
  threshold?: number;
  pricing_mode?: string;
  cpc?: SliderDataInterface;
  cpm?: SliderDataInterface;
  ads_type?: {
    id: string | number;
    name: string;
    media_type?: string;
  };
  media?: Array<object>;
  media_type?: string;
  num_view_threshold_0?: number;
  num_view_threshold_6?: number;
  num_view_threshold_15?: number;
  num_view_threshold_30?: number;
  price_cpm?: number;
  price_cpc?: number;
  remain_budget?: number;
  start_time?: string | number;
  status?: string;
  title?: string;
  description?: string;
  total_money?: number;
  type?: string;
  url?: string;
  user_id?: string | number;
  phone_fee?: Array<SliderDataInterface>;
  arpu?: Array<SliderDataInterface>;
  data_fee?: Array<SliderDataInterface>;
  sim_ages?: Array<SliderDataInterface>;
  os?: Array<ItemTargetingInterface>;
  devices?: Array<ItemTargetingInterface>;
  phone_names?: Array<ItemTargetingInterface>;
  network_data?: Array<ItemTargetingInterface>;
  service_package?: Array<ItemTargetingInterface>;
  relationships?: Array<ItemTargetingInterface>;
  genders?: Array<ItemTargetingInterface>;
  exclude_workplaces?: Array<ItemTargetingInterface>;
  workplaces?: Array<ItemTargetingInterface>;
  exclude_locations?: Array<ItemTargetingInterface>;
  locations?: Array<ItemTargetingInterface>;
  tags?: Array<ItemTargetingInterface>;
  ages?: Array<ItemTargetingInterface>;
  network_suppliers?: Array<ItemTargetingInterface>;
  channels?: Array<ChannelInterface>;
  use_data?: number;
  data_code?: string;
  data_capacity?: number;
  confirm_sms_template?: {
    id: number;
  };
  questions?: any;
  confirm_sms_template_id?: number;
  max_per_ip?: number;
  max_per_phone?: {
    unit: string;
    value: number;
  };
  data_trigger_time?: number;
  event_trackings?: Array<EventTrackingInterface>;
  group_age?: Array<GroupAgeInterface>;
  group_age_id?: number;
}

export interface TimeRangeInterface {
  start: string;
  end: string;
}

export interface ScheduleInterface {
  days: Array<string>;
  times: Array<TimeRangeInterface>;
}

export interface TemplateInterface {
  id: number;
}

export interface PhoneGroupInterface {
  id: number;
  numbers: Array<string>;
}

export interface BannerMMSInterface {
  ads_id?: string | number;
  advertiser_id?: string | number;
  agency_id?: string | number;
  brand_name?: string;
  brandname?: BrandnameInterface;
  brandname_id?: string | number;
  budget?: number;
  budget_mode?: string;
  campaign?: CampaignInterface;
  campaign_id?: string | number;
  campaign_name?: string;
  newCampaign?: CampaignInterface;
  typeCampaign?: string;
  header?: string;
  targeting_type?: string;
  target_file?: string;
  content?: string;
  cat_id?: string;
  created_at?: string | number;
  end_hour?: string | number;
  end_time?: string | number;
  expense?: number;
  id?: string | number;
  item_permissions?: Array<string>;
  max_mms?: number;
  name?: string;
  num_fail?: number;
  num_sent?: number;
  num_success?: number;
  rate_success?: number;
  remain_budget?: number;
  start_hour?: string | number;
  start_time?: string | number;
  status?: string;
  success_rate?: number;
  tempid?: string | number;
  total_fail?: string | number;
  total_money?: string | number;
  total_sent?: string | number;
  total_success?: string | number;
  type?: string;
  user_id?: string | number;
  media_type?: string;
  mms_type?: string | number;
  max_mms_per_day?: number;
  price_cskh?: number;
  price_mms?: number;
  phone_fee?: Array<SliderDataInterface>;
  arpu?: Array<SliderDataInterface>;
  data_fee?: Array<SliderDataInterface>;
  sim_ages?: Array<SliderDataInterface>;
  os?: Array<ItemTargetingInterface>;
  devices?: Array<ItemTargetingInterface>;
  phone_names?: Array<ItemTargetingInterface>;
  network_data?: Array<ItemTargetingInterface>;
  service_package?: Array<ItemTargetingInterface>;
  relationships?: Array<ItemTargetingInterface>;
  genders?: Array<ItemTargetingInterface>;
  exclude_workplaces?: Array<ItemTargetingInterface>;
  workplaces?: Array<ItemTargetingInterface>;
  exclude_locations?: Array<ItemTargetingInterface>;
  locations?: Array<ItemTargetingInterface>;
  tags?: Array<ItemTargetingInterface>;
  network_suppliers?: Array<ItemTargetingInterface>;
  ages?: Array<ItemTargetingInterface>;
  channels?: Array<ChannelInterface>;
  schedule?: Array<ScheduleInterface>;
  mms_user_template_id?: number;
  template?: TemplateInterface;
  phone_group?: PhoneGroupInterface;
  phone_group_id?: number;
  content_type?: boolean;
  has_backup?: number;
  backup_sms?: {
    content: string;
    content_type: number;
    cat_id: string;
  };
  params?: Array<string>;
  params_file?: string;
  group_age?: Array<GroupAgeInterface>;
  group_age_id?: number;
}

export interface BannerSmsInterface {
  ads_id?: string | number;
  advertiser_id?: string | number;
  agency_id?: string | number;
  brand_name?: string;
  brandname?: BrandnameInterface;
  brandname_id?: string | number;
  budget?: number;
  budget_mode?: string;
  campaign?: CampaignInterface;
  campaign_id?: string | number;
  campaign_name?: string;
  newCampaign?: CampaignInterface;
  typeCampaign?: string;
  header?: string;
  targeting_type?: string;
  target_file?: string;
  content?: string;
  cat_id?: string;
  created_at?: string | number;
  end_hour?: string | number;
  end_time?: string | number;
  expense?: number;
  id?: string | number;
  item_permissions?: Array<string>;
  max_sms?: number;
  max_sms_per_day?: number;
  name?: string;
  num_fail?: number;
  num_sent?: number;
  num_success?: number;
  rate_success?: number;
  remain_budget?: number;
  start_hour?: string | number;
  start_time?: string | number;
  status?: string;
  success_rate?: number;
  tempid?: string | number;
  total_fail?: string | number;
  total_money?: string | number;
  total_sent?: string | number;
  total_success?: string | number;
  type?: string;
  user_id?: string | number;
  media_type?: string;
  sms_type?: string | number;
  price_cskh?: number;
  price_mms?: number;
  phone_fee?: Array<SliderDataInterface>;
  arpu?: Array<SliderDataInterface>;
  data_fee?: Array<SliderDataInterface>;
  sim_ages?: Array<SliderDataInterface>;
  os?: Array<ItemTargetingInterface>;
  devices?: Array<ItemTargetingInterface>;
  phone_names?: Array<ItemTargetingInterface>;
  network_data?: Array<ItemTargetingInterface>;
  service_package?: Array<ItemTargetingInterface>;
  relationships?: Array<ItemTargetingInterface>;
  genders?: Array<ItemTargetingInterface>;
  exclude_workplaces?: Array<ItemTargetingInterface>;
  workplaces?: Array<ItemTargetingInterface>;
  exclude_locations?: Array<ItemTargetingInterface>;
  locations?: Array<ItemTargetingInterface>;
  tags?: Array<ItemTargetingInterface>;
  network_suppliers?: Array<ItemTargetingInterface>;
  ages?: Array<ItemTargetingInterface>;
  channels?: Array<ChannelInterface>;
  schedule?: Array<ScheduleInterface>;
  sms_user_template_id?: number;
  template?: TemplateInterface;
  phone_group?: PhoneGroupInterface;
  phone_group_id?: number;
  content_type?: boolean;
  params_file?: string;
}

export interface ConfigMMSInterface {
  id?: string | number;
  max_end_hour?: string | number;
  max_mms?: string | number;
  max_mms_per_day?: string | number;
  min_budget?: {
    mode: string;
    money: number;
    percent_budget: string;
  };
  mode: string;
  money: number;
  percent_budget: string;
  min_start_hour?: string | number;
}

export interface SettingUserPriceInterface {
  created_at?: string | number;
  email?: string;
  full_name?: string;
  id?: string | number;
  item_permissions?: Array<string>;
  max_debt?: number;
  min_threshold_mode?: string;
  mms_balance?: number;
  mms_charge?: number;
  mms_min_threshold_mode?: string;
  mms_recharge?: number;
  mms_threshold_number?: number;
  mms_threshold_percent?: number;
  phone_number?: string | number;
  price_cpm?: number;
  redirect_balance?: number;
  redirect_charge?: number;
  redirect_recharge?: number;
  remain_max_debt?: number;
  status?: string;
  threshold_number?: number;
  threshold_percent?: number;
  username?: string;
}
