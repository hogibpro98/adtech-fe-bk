export default function ({store}, inject) {
  inject("openFilePreviewDialog", (documents: Array<any>) => {
    store.commit("file/show");
    store.commit("file/setDocuments", documents);
  })
}
