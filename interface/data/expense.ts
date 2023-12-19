import { UserInterface } from "~/interface/data/user";
import { FileInterface } from "~/interface/data/file";

export interface RechargeExpenseInterface {
  date?: number;
  user_id?: string | number;
  amount?: number;
  note?: string;
}

export interface TransactionMMSDaily {
  advertiser?: UserInterface;
  advertiser_id?: string | number;
  agency?: UserInterface;
  agency_id?: string | number;
  created_at?: string | number;
  id?: string | number;
  item_permissions?: Array<string>;
  message?: string;
  total_money?: number;
  type?: string;
}

export interface TransactionMMSDailyDetail {
  ads_id?: string | number;
  ads_name?: string;
  advertiser_code?: string;
  advertiser_id?: string | number;
  advertiser_name?: string;
  agency_code?: string;
  agency_id?: string | number;
  agency_name?: string;
  brandname?: string;
  brandname_id?: string | number;
  business_activities_name?: string;
  campaign_id?: string | number;
  campaign_name?: string;
  created_at?: string | number;
  num_fail?: number;
  num_sent?: number;
  num_success?: number;
  price_mms?: number;
  rate_success?: string | number;
  total_money?: number;
  updated_at?: string | number;
}

export interface TransactionRechargeMMSDailyDetail {
  action_type?: string;
  approve_admin?: UserInterface;
  approved_by?: string | number;
  bonus?: number;
  code?: string;
  created_at?: string | number;
  date?: string | number;
  deleted_at?: string | number;
  desc?: string;
  documents?: Array<FileInterface>;
  duration?: number;
  expired_date?: string | number;
  id?: string | number;
  is_system?: number;
  price?: number;
  price_per_mms?: number;
  real_price?: number;
  reject_reason?: string;
  status?: string;
  trans_id?: string | number;
  updated_at?: string | number;
  user?: UserInterface;
  user_daily_code?: string;
}

export interface EWalletInterface {
  id?: number | string;
  trans_id?: number | string;
  code?: string;
  date?: number | string;
  price?: number;
  price_per_mms?: number;
  bonus?: number;
  bonus_percent?: number;
  duration: number;
  status: string;
  documents: Array<FileInterface>;
  desc?: string;
}
