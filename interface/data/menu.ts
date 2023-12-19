export interface MenuItem {
  name: string;
  icon: string;
  groupHeader: string;
  title: string;
  href: string;
  permission: boolean;
  items: MenuItem;
}
