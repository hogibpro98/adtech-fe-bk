import { UserInterface } from "~/interface/data/user";

export interface TagInterface {
  code: string;
  created_at: number;
  description: string;
  id: string | number;
  item_permissions: Array<string>;
  name: string;
  user: UserInterface;
}
