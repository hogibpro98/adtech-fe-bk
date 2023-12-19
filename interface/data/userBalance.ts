export interface UserBalanceInterface {
  created_at?: string | number;
  email: string;
  full_name: string;
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
  phone_number?: string;
  price_cpm?: number;
  redirect_balance?: number;
  redirect_charge?: number;
  redirect_recharge?: number;
  remain_max_debt?: number;
  status?: string;
  threshold_number?: number;
  threshold_percent?: number;
}
