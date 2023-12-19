import WrapperInterface from "~/interface/mixins/wrapper";

export interface SelectDataInterface extends WrapperInterface {
  value: any;
  innerValue: any;
  name: string;
  label: string;
  require: boolean;
  resource: string;
  rules: Array<string> | Array<object> | string;
  vid: string;
  items: Array<string> | Array<object> | string | object;
}
