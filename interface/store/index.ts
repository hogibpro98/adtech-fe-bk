export interface StoreStateInterface {
  drawer: boolean;
  pageTitle: string;
}

export interface StoreInterface {
  state: StoreStateInterface;
  commit(nameMutation: string, params: object): void;
  dispatch(name: string, value: object): void;
  setState(name: string, value: any): void;
  getState(name: string): any;
  removeState(name: string): void;
}
