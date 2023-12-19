import { UserInterface } from "~/interface/data/user";
import { ZoneInterface } from '~/interface/data/zone';

export interface CampaignPriceInterface {
  agency_id?: string | number;
  created_at?: string | number;
  deleted_at?: string | number;
  deleted_by?: string | number;
  id?: string | number;
  max_debt?: number;
  min_threshold_mode?: string;
  mms_min_threshold_mode?: string;
  mms_threshold_number?: number;
  mms_threshold_percent?: number;
  price_cpc?: number;
  price_cpm?: number;
  threshold_number?: number;
  threshold_percent?: number;
  updated_at?: string | number;
  updated_by?: string | number;
  user_id?: string | number;
}

export interface CampaignInterface {
  advertiser?: UserInterface;
  advertiser_id?: string | number;
  agency?: UserInterface;
  agency_id?: string | number;
  budget?: number;
  campaign_id?: string | number;
  created_at?: string | number;
  owner?: UserInterface;
  zone?: ZoneInterface;
  period?: Array<string>;
  ctr?: number;
  end_time?: string | number;
  expense?: number;
  id?: string | number;
  item_permissions?: Array<string>;
  name?: string;
  num_ads_running?: number;
  num_click?: number;
  num_view?: number;
  pending_ads_count?: number;
  price?: CampaignPriceInterface;
  remain_budget?: number;
  remain_budget_create_ads?: number;
  remain_max_debt?: number;
  start_time?: number | string;
  status?: string;
  status_origin?: string;
  total_money?: number;
  user_id?: string | number;
  zone_id?: string | number;
  campaign?: Array<string>;
}
