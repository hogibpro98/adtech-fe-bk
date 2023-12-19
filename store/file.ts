import { FilePreviewInterface } from "~/interface/store/file-preview";

export const state = (): FilePreviewInterface => ({
  isShow: false,
  documents: []
});

export const mutations = {
  hide(state: FilePreviewInterface): void {
    state.isShow = false;
  },
  show(state: FilePreviewInterface): void {
    state.isShow = true;
  },
  toggleDisplay(state: FilePreviewInterface): void {
    if(state.isShow) {
      state.isShow = false;
      state.documents = [];
    } else {
      state.isShow = true;
    }
    // state.isShow = !state.isShow;
  },
  setDocuments(state: FilePreviewInterface, value: Array<any>): void {
    state.documents = value;
  }
};
