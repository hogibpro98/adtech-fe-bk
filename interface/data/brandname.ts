import { UserInterface } from "~/interface/data/user";
import { FileInterface } from "~/interface/data/file";

export interface BusinessActivityInterface {
  name: string;
  id: number;
}

export interface BrandnameInterface {
  advertiser: UserInterface;
  status: string;
  advertiser_id: number;
  agency: UserInterface;
  agency_id: number;
  brand_certificate: FileInterface;
  business_activity: BusinessActivityInterface;
  business_activity_id: number;
  business_name: string;
  business_registration: FileInterface;
  created_at: number;
  deleted_at: number;
  deleted_by: number;
  expire_time: number;
  id: number;
  identify_certificate: FileInterface;
  item_permissions: Array<string>;
  maintain_fee: number;
  name: string;
  price_cskh: number;
  price_mms: number;
  updated_at: number;
  user_id: number;
}
