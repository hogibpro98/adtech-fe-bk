import { RolesInterface } from "~/interface/data/permission";

export interface UserInfoInterface {
  address: string;
  business_registration_document: any;
  capacity_statement_document: any;
  cooperation_proposal_document: any;
  documents: any;
  representative: string;
  tax_no: string;
  user_id: number;
}

export interface UserInterface {
  agency?: UserInterface;
  created_at?: string;
  deleted_at?: string;
  deleted_by?: number;
  email?: string;
  email_verified_at?: string;
  full_name?: string;
  is_agency?: boolean;
  id?: number | string;
  info?: UserInfoInterface;
  services?: Array<string>;
  user_info?: UserInfoInterface;
  password_updated_at?: string;
  permissions?: Array<string>;
  phone_number?: string;
  roles?: Array<RolesInterface>;
  role_ids?: Array<number>;
  status?: string;
  updated_at?: string;
  username?: string;
  wallet?: {
    wallet_id?: number | string;
    balance?: number;
  };
}
