export const ROLE_AGENCY = "agency";
export const ROLE_PUBLISHER = "publisher";
export const ROLE_INSPECTOR = "inspector";
export const ROLE_ADVERTISER = "advertiser";
export const ROLE_ADMIN = "admin";
export const ROLE_CMS_ADMIN = "cms_admin";
export const ROLE_SUPER_ADMIN = "super_admin";
export const ROLE_IS_ADMIN = [ROLE_ADMIN, ROLE_SUPER_ADMIN, ROLE_CMS_ADMIN];
export const ROLE_ACCOUNTANT = "accountant";
export const ROLE_ADMIN_OR_AGENCY = [
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
  ROLE_AGENCY,
  ROLE_CMS_ADMIN
];
