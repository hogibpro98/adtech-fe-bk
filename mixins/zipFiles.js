import JSZip from "jszip";
import JSZipUtils from "jszip-utils";
import saveAs from "file-saver";
export default {
  methods: {
    nameGenerator() {
      let name = "vda-";
      const time = new Date();
      name =
        name +
        time.getSeconds() +
        time.getMinutes() +
        time.getHours() +
        time.getDate() +
        time.getMonth() +
        time.getFullYear();
      return name;
    },
    urlToPromise(url) {
      return new Promise(function(resolve, reject) {
        JSZipUtils.getBinaryContent(url, function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    },
    handleDownloadAllDocument(documents) {
      this.isZipping = true;
      setTimeout(() => {
        const zip = new JSZip();
        for (let i = 0; i < documents.length; i++) {
          zip.file(documents[i].name, this.urlToPromise(documents[i].url));
        }
        zip.generateAsync({ type: "blob" }).then(content => {
          const name = this.nameGenerator();
          saveAs(content, name);
          this.isZipping = false;
        });
      }, 1500);
    }
  }
};
