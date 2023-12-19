export interface FilterInterface {
  type?: string;
  name?: string;
  request_name?: string;
  min?: number;
  max?: number;
  value?: any;
  label?: string;
  visible?: boolean;
  filter_type?: string;
  selected?: boolean;
  itemValue?: any;
  props?: {
    rules?: any;
    multiple?: boolean;
    queryParams?: {
      type?: string;
    };
    label?: string;
  };
}
