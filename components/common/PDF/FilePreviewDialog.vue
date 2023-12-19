<template>
  <v-dialog
    :value="isShow"
    :content-class="contentClass"
    @input="toggleDisplay"
  >
    <div v-if="documents.length > 0" class="file-preview-content">
      <div :class="{ hidden: !isShowHeader }" class="document-header">
        <div class="d-flex align-items-center w-50-percent">
          <div class="file-name mr-1" :title="documents[currentDocument].name">
            {{ documents[currentDocument].name }}
          </div>
          ({{ currentDocument + 1 }}/{{ documents.length }})
        </div>
        <div>
          <v-tooltip bottom>
            <template #activator="{on, attrs}">
              <a :href="documents[currentDocument].url + '?view'" target="_blank">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon class="white--text">mdi-file-move-outline</v-icon>
                </v-btn>
              </a>
            </template>
            <span>Mở trong trang mới</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on, attrs}">
              <a
                :href="documents[currentDocument].url"
                @click.prevent="
                  handleDownloadDocument(documents[currentDocument])
                "
              >
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon class="white--text">mdi-download</v-icon>
                </v-btn>
              </a>
            </template>
            <span>Tải tài liệu</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on, attrs}">
              <a @click.prevent="handleDownloadAllDocument()">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon class="white--text"
                    >mdi-briefcase-download-outline
                  </v-icon>
                </v-btn>
              </a>
            </template>
            <span>Tải tất cả tài liệu</span>
          </v-tooltip>
        </div>
      </div>
      <div
        :class="{ 'disable-btn': documents.length === 1 }"
        class="previous-document-icon"
        @click="handlePreviousDocumentClick"
      >
        <v-icon class="white--text" style="font-size: 50px"
          >mdi-chevron-left</v-icon
        >
      </div>
      <div
        :class="{ 'disable-btn': documents.length === 1 }"
        class="next-document-icon"
        @click="handleNextDocumentClick"
      >
        <v-icon class="white--text" style="font-size: 50px"
          >mdi-chevron-right</v-icon
        >
      </div>
      <div
        v-if="getFileType(documents[currentDocument].url) === 'pdf'"
        :class="{ hidden: !isShowHeader }"
        class="pdf-controller"
      >
        Trang:
        <v-icon
          :disabled="isDisablePreviousPageBtn"
          class="white--text"
          @click="handlePreviousPage"
          >mdi-chevron-left</v-icon
        >
        <div class="d-flex align-items-center">
          <v-text-field
            :value="currentPage"
            class="input-page-num mr-1"
            light
            dense
            type="number"
            hide-spin-buttons
            min="1"
            :max="documents[currentDocument].pageCount"
            solo
            hide-details
            style="width: 50px"
            @input="handlePdfPageInput"
            @change="handlePdfPageChange($event)"
          />
          /
          <div v-if="displayPageCount" class="ml-1">
            {{ documents[currentDocument].pageCount }}
          </div>
          <v-progress-circular v-else class="ml-1" indeterminate size="20" />
        </div>
        <v-icon
          :disabled="isDisableNextPageBtn"
          class="white--text"
          @click="handleNextPage()"
          >mdi-chevron-right</v-icon
        >
      </div>

      <div
        v-if="documents.length > 0"
        class="file-container"
        @mousemove="handleMouseOver"
      >
        <div v-if="loadFailed" class="file-loaded-fail">
          <v-icon class="white--text mr-2 font-32"
            >mdi-alert-circle-outline</v-icon
          >
          Không có bản xem trước hoặc đã xảy ra lỗi, vui lòng thử lại !!!
        </div>
        <div
          v-if="getFileType(documents[currentDocument].url) === 'img'"
          class="img-container"
        >
          <v-img :key="imgSrc" :src="imgSrc" />
        </div>
        <vue-pdf-wrapper
          v-if="getFileType(documents[currentDocument].url) === 'pdf'"
          :page="parseInt(currentPage)"
          :src="documents[currentDocument].url"
          @num-pages="getPageCount($event, currentDocument)"
          @link-clicked="currentPage = $event"
          @error="handlePdfError"
        />
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import saveAs from "file-saver";
import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import VuePdfWrapper from "~/components/common/PDF/VuePdfWrapper.vue";
const JSZip = () => import('jszip');
const JSZipUtils = () => import('jszip-utils');

interface File {
  url: string;
  size: number;
  name: string;
}
interface ComponentData {
  documents: Array<any>;
  tab: number;
  timeOutDisplay: any;
  isShowHeader: boolean;
  currentPage: number;
  pageCount: number;
  displayPageCount: boolean;
  currentDocument: number;
  loadFailed: boolean;
}
interface ComponentMethod {
  handlePreviousDocumentClick(): void;
  handleNextDocumentClick(): void;
  getFileType(fileName: string): string;
  handleMouseOver(): void;
  handlePreviousPage(): void;
  handleNextPage(i: number): void;
  handleDownloadDocument(file: File): void;
  getPageCount(totalPage: number, i: number): void;
  handlePdfPageChange(value: number, i: number): void;
  handlePdfPageInput(): void;
  toggleDisplay(): void;
  handlePdfError(): void;
  handleDownloadAllDocument(): void;
  urlToPromise(url: string): Promise<any>;
  nameGenerator(): void;
}
interface ComponentComputed {
  storeDocuments: Array<any>;
  docType: string;
  imgSrc: string;
  contentClass: string;
  isShow: boolean;
  isDisableNextPageBtn: boolean;
  isDisablePreviousPageBtn: boolean;
}
interface ComponentProp {
  isShow: boolean;
}

const INDEX = {
  FIRST_PAGE: 1,
  FIRST_DOCUMENT: 0
};

const FilePreviewDialog = Vue.extend<
  ComponentData,
  ComponentMethod,
  ComponentComputed,
  ComponentProp
>({
  components: {
    VuePdfWrapper
  },
  data() {
    return {
      numPages: null,
      tab: 0,
      currentDocument: 0,
      documents: [],
      timeOutDisplay: null,
      isShowHeader: true,
      currentPage: 1,
      pageCount: 0,
      displayPageCount: false,
      loadFailed: false
    };
  },
  computed: {
    docType() {
      switch (this.getFileType(this.documents[this.currentDocument].url)) {
        case "word":
        case "excel":
          return "office";
        case "xml":
          return "code";
        case "txt":
          return "text";
      }
      return null;
    },
    storeDocuments() {
      return this.$store.state.file.documents;
    },
    imgSrc() {
      return this.documents[this.currentDocument].url;
    },
    contentClass() {
      return "flex xs12 sm8 md6 lg3-5";
    },
    isShow() {
      return this.$store.state.file.isShow;
    },
    isDisableNextPageBtn() {
      return this.currentPage == this.documents[this.currentDocument].pageCount;
    },
    isDisablePreviousPageBtn() {
      return this.currentPage == INDEX.FIRST_PAGE;
    }
  },
  watch: {
    storeDocuments: {
      deep: true,
      handler(val) {
        this.documents = cloneDeep(val);
        for (let i = 0; i < this.documents.length; i++) {
          if (this.getFileType(this.documents[i].url) === "pdf") {
            this.documents[i].pageCount = 0;
          }
        }
      }
    },
    currentPage() {
      this.handleMouseOver();
    },
    tab() {
      this.handleMouseOver();
    },
    currentDocument() {
      this.handleMouseOver();
    },
    isShow(val) {
      if (val) {
        this.currentDocument = INDEX.FIRST_DOCUMENT;
        this.currentPage = INDEX.FIRST_PAGE;
      }
    }
  },
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
    handleDownloadAllDocument() {
      const zip = new JSZip();
      for (let i = 0; i < this.documents.length; i++) {
        zip.file(
          this.documents[i].name,
          this.urlToPromise(this.documents[i].url)
        );
      }
      zip.generateAsync({ type: "blob" }).then(content => {
        const name = this.nameGenerator();
        saveAs(content, name);
      });
    },
    handlePdfError() {
      this.loadFailed = true;
    },
    toggleDisplay() {
      this.$store.commit("file/toggleDisplay");
    },
    handlePdfPageInput() {
      this.handleMouseOver();
    },
    getPageCount(totalPage, i) {
      if (totalPage) {
        this.documents[i].pageCount = totalPage;
        this.displayPageCount = true;
      } else this.displayPageCount = false;
    },
    handlePdfPageChange(value) {
      if (value < 1 || value > this.documents[this.currentDocument].pageCount) {
        this.currentPage = INDEX.FIRST_PAGE;
      } else {
        this.currentPage = value;
      }
    },
    async handleDownloadDocument(file) {
      try {
        if (typeof file === "object") {
          const download = await this.$api.$get(`${file.url}`, {
            responseType: "blob"
          });
          saveAs(download, file.name);
        } else if (typeof file === "string") {
          const download = await this.$api.$get(`${file}`, {
            responseType: "blob"
          });
          saveAs(download, file);
        }
      } catch (e) {
        this.$toast.global.action_fail();
        console.log(e);
      }
    },
    handleMouseOver() {
      clearTimeout(this.timeOutDisplay);
      this.isShowHeader = true;
      this.timeOutDisplay = setTimeout(() => {
        this.isShowHeader = false;
      }, 3000);
    },
    handlePreviousPage() {
      if (this.currentPage > INDEX.FIRST_PAGE) {
        this.currentPage--;
      }
    },
    handleNextPage() {
      if (this.currentPage < this.documents[this.currentDocument].pageCount) {
        this.currentPage++;
      }
    },
    handlePreviousDocumentClick() {
      this.currentPage = INDEX.FIRST_PAGE;
      if (this.currentDocument > INDEX.FIRST_DOCUMENT) {
        this.currentDocument = this.currentDocument - 1;
      } else {
        this.currentDocument = this.documents.length - 1;
      }
    },
    handleNextDocumentClick() {
      this.currentPage = INDEX.FIRST_PAGE;
      if (this.currentDocument < this.documents.length - 1) {
        this.currentDocument = this.currentDocument + 1;
      } else {
        this.currentDocument = INDEX.FIRST_DOCUMENT;
      }
    },
    getFileType(file) {
      if (file) {
        let suffixIndex;
        for (let i = file.length; i--; i < 0) {
          if (file.charAt(i) === ".") {
            suffixIndex = i;
            break;
          }
        }
        const suffix = file.substring(suffixIndex + 1).toLowerCase();
        switch (suffix) {
          case "pdf":
            this.loadFailed = false;
            return "pdf";
          case "png":
          case "jpg":
          case "jpeg":
          case "gif":
            this.loadFailed = false;
            return "img";
          case "doc":
          case "docx":
            this.loadFailed = true;
            return "word";
          case "xls":
          case "xlsx":
            this.loadFailed = true;
            return "excel";
          case "xml":
            this.loadFailed = true;
            return "xml";
          case "txt":
            this.loadFailed = true;
            return "txt";
        }
      }
      this.loadFailed = true;
      return undefined;
    }
  }
});
export default FilePreviewDialog;
</script>

<style scoped>
.file-preview-content {
  position: relative;
  overflow-y: auto;
  background-color: white;
}
.file-container {
  position: relative;
  top: 0;
  max-height: 840px;
  overflow-y: auto;
}
.previous-document-icon {
  position: absolute;
  top: 50%;
  left: 3%;
  background-color: #959595;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  transform: translateY(-50%);
  opacity: 0.5;
}
.next-document-icon {
  position: absolute;
  top: 50%;
  right: 3%;
  background-color: #959595;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  transform: translateY(-50%);
  opacity: 0.5;
}
.disable-btn {
  cursor: not-allowed;
}
.disable-btn:hover {
  background-color: #959595 !important;
}
.previous-document-icon:hover,
.next-document-icon:hover {
  background-color: #1a73e8;
}
.pdf-controller {
  position: absolute;
  color: white;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 4%;
  background: rgba(0, 0, 0, 0.75);
  height: 50px;
  width: 250px;
  border-radius: 4px;
  z-index: 10;
  left: 50%;
  padding: 0 16px;
  transform: translateX(-50%);
  transition: all 0.1s linear;
}
.document-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  padding: 16px 16px;
  z-index: 10;
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.65) 0%,
    transparent 100%
  );
  font-size: 18px;
  color: white;
  height: 60px;
  transition: all 0.1s linear;
  opacity: 1;
}
.hidden {
  opacity: 0;
}
.input-page-num >>> input[type="number"] {
  -moz-appearance: textfield;
}
.input-page-num >>> input::-webkit-outer-spin-button,
.input-page-num >>> input::-webkit-inner-spin-button {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
.input-page-num >>> input {
  text-align: center;
}
.img-container {
  background-image: url("@/static/background/transparent-bg.jpg");
  background-repeat: repeat;
}
.file-name {
  max-width: 100%;
  display: inline-block;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.file-loaded-fail {
  height: 250px;
  width: 100%;
  background-color: grey;
  color: white;
  font-size: 19px;
  padding: 0 58px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
</style>
