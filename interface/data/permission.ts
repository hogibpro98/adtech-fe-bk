import { UserInterface } from "~/interface/data/user";

export interface PivotInterface {
  user_id: number;

  role_id: number;
}

export interface RolesInterface {
  created_at: number;

  default_page: string;
  description: string;

  display_name: string;
  id: number;

  is_system: number;
  name: string;
  pivot: PivotInterface;

  updated_at: number;
}

export interface PermissionInterface {
  description?: string;
  display_name?: string;
  id?: string | number;
  item_permissions?: Array<string>;
  name?: string;
}

export interface WhitelistIp {
  created_at?: string | number;
  id?: string | number;
  ip?: string;
  item_permissions?: Array<string>;
  role: RolesInterface;
  role_id?: string | number;
  updated_at?: string | number;
  updated_by?: string | number;
  updated_user?: UserInterface;
}
