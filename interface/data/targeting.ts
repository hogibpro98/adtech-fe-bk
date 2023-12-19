import { UserInterface } from "~/interface/data/user";

export interface DeviceInterface {
  code: string;

  created_at: number;
  id: number;

  item_permissions: Array<string>;
  name: string;
  user: UserInterface;

  user_id: number;
}

export interface LocationInterface {
  code: string;

  created_at: number;
  id: number;
  level: string;

  item_permissions: Array<string>;
  name: string;
  parent: LocationInterface;

  parent_id: number;
  user: UserInterface;

  user_id: number;
}

export interface OSInterface {
  code: string;

  created_at: number;
  id: number;

  item_permissions: Array<string>;
  name: string;
  user: UserInterface;

  user_id: number;
}

export interface PhoneNameInterface {
  code: string;

  created_at: number;
  id: number;

  item_permissions: Array<string>;
  name: string;
  user: UserInterface;

  user_id: number;
}

export interface PhoneGroupInterface {
  name: string;
  numbers: Array<string>;
  target_file: string;
  type: string;
  user: UserInterface;
  user_id: number;
}

export interface GenderInterface {
  code: string;

  created_at: number;
  id: number;

  item_permissions: Array<string>;
  name: string;
  user: UserInterface;

  user_id: number;
}

export interface NetworkDataInterface {
  code: string;

  created_at: number;
  id: number;

  item_permissions: Array<string>;
  name: string;
  user: UserInterface;

  user_id: number;
}

export interface RelationshipInterface {
  code: string;

  created_at: number;
  id: number;

  item_permissions: Array<string>;
  name: string;
  user: UserInterface;

  user_id: number;
}

export interface ServicePackageInterface {
  code: string;

  created_at: number;
  id: number;

  item_permissions: Array<string>;
  name: string;
  user: UserInterface;

  user_id: number;
}

export interface TagInterface {
  code: string;

  created_at: number;
  id: number;

  item_permissions: Array<string>;
  name: string;
  user: UserInterface;
  parent: TagInterface;
  parent_id: number;
  user_id: number;
}

export interface ManageAgeGroupFormInterface {
  id: number;
  code: string;
  name: string;
  min_age: number;
  max_age: number;
  item_permissions: Array<string>;
}
