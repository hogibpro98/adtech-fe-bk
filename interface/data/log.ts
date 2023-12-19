import {BannerMMSInterface, BannerRedirectInterface} from "~/interface/data/banner";
import {UserInterface} from "~/interface/data/user";
import {CampaignInterface} from '~/interface/data/campaign';

export interface LogAdsInterface {
  action_type?: string;
  ads?: BannerMMSInterface | BannerRedirectInterface;
  ads_id?: string | number;
  created_at?: string | number;
  id?: string | number;
  ip?: string;
  item_permissions?: Array<string>;
  log_id?: string | number;
  new_data?: BannerMMSInterface | BannerRedirectInterface;
  note?: string;
  old_data?: BannerMMSInterface | BannerRedirectInterface;
  type?: string;
  user?: UserInterface;
  user_id?: string | number;
}

export interface LogCampaignInterface {
  action_type?: string;
  campaign?: CampaignInterface;
  campaign_id?: string | number;
  created_at?: string | number;
  id?: string | number;
  ip?: string;
  item_permissions?: Array<string>;
  log_id?: string | number;
  new_data?: CampaignInterface;
  note?: string;
  old_data?: CampaignInterface;
  user?: UserInterface;
  user_id?: string | number;
}

export interface MMSDistributionInterface {
  ads_id?: number | string;
  ads_name?: string;
  advertiser?: UserInterface;
  advertiser_id?: number | string;
  agency?: UserInterface;
  agency_id?: number | string;
  brandname?: string;
  business_activity?: string;
  campaign_id?: number | string;
  created_at?: number | string;
  date?: number | string;
  desc?: string;
  err_desc?: string;
  id?: number | string;
  is_retry?: number;
  item_permissions?: Array<string>;
  message?: string;
  mms_header?: string;
  mms_type?: number;
  price?: number;
  schedule_id?: number | string;
  sent_at?: number | string;
  status?: string;
  sub_id?: number | string;
  temp_id?: number | string;
  updated_at?: number | string;
}

export interface SMSDistributionInterface {
  ads_id?: number | string;
  ads_name?: string;
  advertiser?: UserInterface;
  advertiser_id?: number | string;
  agency?: UserInterface;
  agency_id?: number | string;
  brandname?: string;
  business_activity?: string;
  campaign_id?: number | string;
  created_at?: number | string;
  date?: number | string;
  desc?: string;
  err_desc?: string;
  id?: number | string;
  is_retry?: number;
  item_permissions?: Array<string>;
  message?: string;
  mms_header?: string;
  mms_type?: number;
  price?: number;
  schedule_id?: number | string;
  sent_at?: number | string;
  status?: string;
  sub_id?: number | string;
  temp_id?: number | string;
  updated_at?: number | string;
}

export interface DataDistributionInterface {
  ads_id?: number | string;
  ads_name?: string;
  advertiser?: UserInterface;
  advertiser_id?: number | string;
  agency?: UserInterface;
  agency_id?: number | string;
  brandname?: string;
  business_activity?: string;
  campaign_id?: number | string;
  created_at?: number | string;
  date?: number | string;
  desc?: string;
  err_desc?: string;
  id?: number | string;
  is_retry?: number;
  item_permissions?: Array<string>;
  message?: string;
  mms_header?: string;
  mms_type?: number;
  price?: number;
  schedule_id?: number | string;
  sent_at?: number | string;
  status?: string;
  sub_id?: number | string;
  temp_id?: number | string;
  updated_at?: number | string;
}
