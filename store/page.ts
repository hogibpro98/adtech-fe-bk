import { PageStateInterface } from "~/interface/store/page";

export const state = (): PageStateInterface => ({
  pageTitle: ""
});

export const mutations = {
  SET_PAGE_TITLE(newState: PageStateInterface, pageTitle: string) {
    newState.pageTitle = pageTitle;
  }
};
