export interface FormInterface {
  reset(): void;
  resetValidation(): void;
  setErrors(error: Object): void;
  validate(): Promise<boolean>;
}

export interface FormDataInterface {
  name: string;
  rules: Array<string> | Array<object> | string;
  vid: string;
}
