import { FormInterface } from "~/interface/vee-validate/form";

export interface DialogInterface {
  show(data?: any, option?: any): void;
  resetData(): void;
  setErrors(error: Object): void;
  reset(): void;
  showing: boolean;
  loading: boolean;

  hide(): void;
  hidden(): void;
}

export interface FormDialogInterface extends DialogInterface {
  item: any;
  $refs: {
    form: FormInterface;
  };
}
