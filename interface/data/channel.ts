import { InventoryInterface } from "~/interface/data/inventory";
import { TagInterface } from "~/interface/data/tag";
import { UserInterface } from "~/interface/data/user";

export interface ChannelInterface {
  channel_id?: number | string;
  created_at?: number;
  deleted_at?: number;
  deleted_by?: number | string;
  description?: string;
  id?: number | string;
  inventory?: InventoryInterface;
  inventory_id?: number | string;
  item_permissions?: Array<string>;
  name?: string;
  tags?: Array<TagInterface>;
  updated_at?: number;
  url?: string;
  user?: UserInterface;
  user_id?: number | string;
}
