import { UserInterface } from "~/interface/data/user";
import { DisplayAdsTypeInterface } from "~/interface/data/displayAdsType";
import { ChannelInterface } from "~/interface/data/channel";

export interface RowColumnData {
  row?: number;
  column?: number;
}

export interface SizeData {
  large: RowColumnData;
  small: RowColumnData;
}

export interface ZoneInterface {
  ads_type?: DisplayAdsTypeInterface;
  ads_type_id?: number | string;
  channel?: ChannelInterface;
  channel_id?: number | string;
  created_at?: number;
  deleted_at?: number;
  deleted_by?: number | string;
  description?: string;
  id?: number | string;
  item_permissions?: Array<string>;
  name?: string;
  size?: SizeData;
  updated_at?: number;
  user?: UserInterface;
  user_id?: string | number;
  zone_id?: string | number;
}
