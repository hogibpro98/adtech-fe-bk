import { DrawerStateInterface } from "~/interface/store/drawer";

export const state = (): DrawerStateInterface => ({
  drawer: true
});

export const mutations = {
  toggleDrawer(newState: DrawerStateInterface): void {
    newState.drawer = !newState.drawer;
  },
  drawer(newState: DrawerStateInterface, val: boolean): void {
    newState.drawer = val;
  }
};
