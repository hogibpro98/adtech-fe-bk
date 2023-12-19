import { UserInterface } from "~/interface/data/user";
import { FileInterface } from "~/interface/data/file";

export interface OrderRechargeInterface {
  action_type?: string;
  approve_admin?: UserInterface;
  approved_by?: string | number;
  bonus?: number;
  code?: string;
  created_at?: string | number;
  date?: string | number;
  deleted_at?: string | number;
  desc?: string;
  documents: Array<FileInterface>;
  duration?: number;
  expired_date?: string | number;
  id?: string | number;
  is_system?: number;
  item_permissions?: Array<string>;
  price?: number;
  price_per_mms?: number;
  real_price?: number;
  reject_reason?: string;
  status?: string;
  trans_id?: string | number;
  updated_at?: string | number;
  user?: UserInterface;
  user_daily_code?: string;
  user_id?: string | number;
}
