import { UserInterface } from "~/interface/data/user";

export interface InventoryInterface {
  created_at?: number;
  deleted_at?: number;
  deleted_by?: number | string;
  id?: string | number;
  inventory_id?: string | number;
  item_permissions?: Array<string>;
  name?: string;
  type?: string;
  updated_at?: number;
  url?: string;
  user?: UserInterface;
  user_id?: string | number;
}
