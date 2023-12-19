import { UserInterface } from "~/interface/data/user";

export interface ImageTemplateInterface {
  height?: number;
  width?: number;
  image?: string;
  image_src?: string;
  name?: string;
}

export interface DisplayAdsTypeInterface {
  created_at?: number;
  description?: string;
  device?: object;
  id?: number | string;
  image_demo?: string;
  image_templates?: Array<ImageTemplateInterface>;
  item_permissions?: Array<string>;
  media_type?: string;
  name?: string;
  platform?: object;
  user?: UserInterface;
  user_id?: number | string;
}
