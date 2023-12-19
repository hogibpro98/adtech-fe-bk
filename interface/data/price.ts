import { UserInterface } from "~/interface/data/user";

export interface PriceService {
  id?: number;
  agency_id?: number;
  cat_id?: string;
  service?: string;
  price?: number;
  created_at?: any;
  updated_at?: any;
  item_permissions?: Array<string>;
  agency?: UserInterface;
}
