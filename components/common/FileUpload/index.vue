<template>
  <v-tabs-items v-model="tab">
    <v-tab-item :v-show="true" value="tab-upload-file" eager>
      <validation-provider
        v-slot="{ errors, valid }"
        ref="provider"
        :name="label || name"
        :rules="computedRules"
        :vid="name"
      >
        <div class="d-flex align-items-center mt-2">
          <label
            v-model="value"
            :class="resError || errors.length > 0 ? 'error--text' : ''"
            class="v-label py-2"
          >
            {{ displayLabel || label }}
            <span v-if="required" class="error--text"> (*) </span>
          </label>
          <slot v-if="$scopedSlots.appendTitle" name="appendTitle"></slot>
        </div>
        <div v-if="disabled">
          <a v-if="disabled && isString(value)" :href="value" target="_blank">
            Link
          </a>
          <a
            v-if="disabled && isObject(value)"
            :href="value.url"
            target="_blank"
          >
            {{ value.name }}
          </a>
          <template v-if="disabled && isArrayString(value)">
            <a
              v-for="(src, i) in value"
              :key="`upload-item-${i}`"
              :href="src"
              target="_blank"
            >
              {{ src }}
            </a>
          </template>
          <template v-if="disabled && isArrayObject(value)">
            <a
              v-for="(item, i) in value"
              :key="`upload-item-${i}`"
              :href="item.url"
              target="_blank"
            >
              {{ item.name }}
            </a>
          </template>
          <p v-if="disabled && !value" class="text--disabled">
            Không có tài liệu
          </p>
        </div>
        <vue-transmit
          v-if="!disabled"
          ref="uploader"
          :url="url"
          :max-files="maximum === 1 ? 2 : maximum"
          :max-file-size="maxFileSize"
          :accepted-file-types="accept"
          :dict-invalid-file-type="errInvalidFileType"
          :dict-file-too-big="
            'Dung lượng file không được vượt quá {{ maxFileSize }}MB.'
          "
          :dict-max-files-exceeded="
            'Không thể upload nhiều hơn {{maxFiles}} file'
          "
          :class="resError || errors.length > 0 ? 'error--text' : ''"
          v-bind="$attrs"
          :style="cssVars"
          class="v-transmit my-2"
          upload-area-classes="v-transmit"
          param-name="file_upload"
          @success="handleUploadSuccess"
          @error="handleUploadFail"
          @mouseenter.native="focusElement = true"
          @mouseleave.native="focusElement = false"
          @accepted-file="addFile"
          @processing="handleProcessing"
          v-on="$listeners"
        >
          <preview-file
            :v-if="files && files.length > 0"
            :files="files"
            :cells-light-box="cellsLightBox"
            :maximum="maximum"
          />
          <control-preview
            :files="files"
            :accepted-file-types="accept"
            :cells-light-box="cellsLightBox"
            :maximum="maximum"
            :focus-element="focusElement"
            class="v-transmit__control-preview"
            v-on="$listeners"
            @clear-file="clearFile"
            @add-file="triggerBrowse"
            @to-tab-edit-file="tab = 'tab-edit-file'"
          />
        </vue-transmit>
        <div class="v-text-field__details mt-2">
          <div class="v-messages theme--light error--text" role="alert">
            <div class="v-messages__wrapper">
              <div class="v-messages__message">
                {{ resError || (errors && errors[0]) }}
              </div>
            </div>
          </div>
        </div>
      </validation-provider>
    </v-tab-item>
    <v-tab-item :v-show="true" value="tab-edit-file">
      <manage-file
        :files="files"
        @back="tab = 'tab-upload-file'"
        @remove-file="removeFile"
      />
    </v-tab-item>
  </v-tabs-items>
</template>

<script lang="ts">
import ControlPreview from "@/components/common/FileUpload/ControlPreview.vue";
import ManageFile from "@/components/common/FileUpload/ManageFile.vue";
import PreviewFile from "@/components/common/FileUpload/PreviewFile.vue";
import { AUDIO, IMAGE, VIDEO, DOCUMENT } from "@/constants/fileType";
import * as typeofValue from "@/util/typeof";
import {
  URL_AUDIO_REGEX,
  URL_IMAGE_REGEX,
  URL_VIDEO_REGEX
} from "@/constants/regex";
import lodash, { union, isEqualWith, pick, isEqual, cloneDeep } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { getErrorMsg } from "@/helpers/ultis";
import Vue, { VueConstructor } from "vue";
import { VueTransmit } from "vue-transmit/dist/src";
import VTransmitFile from "vue-transmit/dist/src/classes/VTransmitFile";
import { UPLOAD_URL } from "~/constants/resource";
import { CODE_SUCCESS } from "~/constants/code";
import { isArray, isObject } from "~/util/typeof";

interface ComponentData {
  resError: string;
  uploader: VueTransmit;
  $refs: {
    uploader: VueTransmit;
  };
  focusElement: boolean;
  files: Array<VueTransmit>;
  tab: string;
}

interface ComponentMethods {
  triggerBrowse(): void;
  customizerEqualFile(objValue: any, othValue: any): boolean;
  pushFileSingleProps(files: Array<VueTransmit>): void;
  pushFileMultiProps(files: Array<VueTransmit>): void;
  updateFileMulti(files: Array<VueTransmit>): void;
  updateFileSingle(file: VueTransmit): void;
  updateValueToFile(val: any): void;
  getFileTypeByUrl(url: string): string;
  handleUploadSuccess(file: VueTransmit, res: any): void;
  handleUploadFail(file: VueTransmit, errorMsg: string, xhrData: object): void;
  clearFile(): void;
  removeFile(id: string): void;
  isString(value: any): boolean;
  isObject(value: any): boolean;
  isArrayString(value: any): boolean;
  isArrayObject(value: any): boolean;
  addFile(newFile: VTransmitFile): void;
}

const FileUpload = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "FileUpload",
  components: { ManageFile, ControlPreview, PreviewFile },
  props: {
    name: {
      type: String,
      default: "file"
    },
    height: {
      type: [String, Number],
      default: "23vh"
    },
    maximum: {
      type: [Number, String],
      default: () => 1
    },
    cellsLightBox: {
      type: Number,
      default: () => 3
    },
    label: {
      type: String,
      default: "File"
    },
    displayLabel: {
      type: String,
      default: ""
    },
    value: {
      type: [Array, String, Object],
      default: null
    },
    required: {
      default: false,
      type: Boolean
    },
    rules: {
      type: [Object, String],
      default: ""
    },
    url: {
      type: String,
      default: UPLOAD_URL
    },
    accept: {
      type: Array,
      default: () => union(IMAGE, DOCUMENT, AUDIO, VIDEO)
    },
    maxFileSize: {
      type: Number,
      default: 30
    },
    returnObject: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uploading: false,
      resError: null,
      focusElement: false,
      files: [],
      tab: "tab-upload-file"
    };
  },

  computed: {
    computedRules() {
      const computedRules = cloneDeep(this.rules);
      if (typeof this.rules === "string") {
        return this.rules + `|fileUpload:${this.uploading}`;
      } else if (typeof this.rules === "object") {
        computedRules.fileUpload = [`${this.uploading}`];
        return computedRules;
      }
    },

    uploader() {
      return this.$refs.uploader;
    },
    cssVars() {
      let height = this.height;
      if (typeof this.height === "number") {
        height = this.height + "px";
      }

      return {
        "--height": height
      };
    },
    adapterOptions() {
      return {
        url: this.url
      };
    },
    data() {
      return this.files.map(f => f.url).filter(url => !!url);
    },
    errInvalidFileType() {
      return `${this.label ||
        "File upload"} phải thuộc định dạng ${this.accept.join(", ")}`;
    }
  },
  watch: {
    data(val) {
      if (val && val.length > 0) {
        if (this.maximum > 1) {
          this.pushFileMultiProps(val);
        } else if (!isEqualWith([this.value], val, this.customizerEqualFile)) {
          this.pushFileSingleProps(val);
        }
      }

      if (!val) {
        this.clearFile();
      }
    },
    value(val) {
      this.updateValueToFile(val);
    }
  },
  mounted() {
    this.updateValueToFile(this.value);
  },
  methods: {
    handleProcessing() {
      this.uploading = true;
    },
    triggerBrowse() {
      this.uploader.triggerBrowseFiles();
    },
    customizerEqualFile(objValue, othValue) {
      if (isArray(objValue) || isArray(othValue)) {
        const listSrc1 = (objValue || []).map(item => item?.url || item);
        const listSrc2 = (othValue || []).map(item => item?.url || item);
        return isEqual(listSrc1, listSrc2);
      }

      let url1, url2;
      if (isObject(objValue)) {
        url1 = objValue.url;
      } else {
        url1 = objValue;
      }

      if (isObject(othValue)) {
        url2 = othValue.url;
      } else {
        url2 = othValue;
      }

      return url1 === url2;
    },
    pushFileSingleProps(files) {
      if (this.returnObject) {
        if (this.files[0].url) {
          this.$emit("input", pick(this.files[0], ["url", "name", "size"]));
        }
      } else {
        this.$emit("input", files[0]);
      }
    },
    pushFileMultiProps(files) {
      if (!isEqualWith(this.value, files, this.customizerEqualFile)) {
        if (this.returnObject) {
          this.$emit(
            "input",
            this.files
              .filter(f => !!f.url)
              .map(file => pick(file, ["url", "name", "size"]))
          );
        } else {
          this.$emit("input", files);
        }
      }
    },
    updateFileMulti(files) {
      if (
        isArray(files) &&
        !isEqualWith(files, this.data, this.customizerEqualFile)
      ) {
        this.files = files.map(item => {
          if (this.returnObject) {
            const { url, name, size, nativeFile = {} } = item || {};
            return {
              id: uuidv4(),
              file_url: url,
              url,
              size,
              type: this.getFileTypeByUrl(url),
              name,
              nativeFile,
              upload: {
                progress: 100
              }
            };
          } else {
            return {
              id: uuidv4(),
              file_url: item,
              url: item,
              type: this.getFileTypeByUrl(item),
              name: "",
              upload: {
                progress: 100
              }
            };
          }
        });
      }
    },
    updateFileSingle(file) {
      if (this.returnObject) {
        const { url, name, nativeFile = {} } = file;
        this.files = [
          {
            id: uuidv4(),
            file_url: url,
            url,
            type: this.getFileTypeByUrl(url),
            name,
            nativeFile,
            upload: {
              progress: 100
            }
          }
        ];
      } else {
        this.files = [
          {
            id: uuidv4(),
            file_url: file,
            url: file,
            type: this.getFileTypeByUrl(file),
            name: "",
            upload: {
              progress: 100
            }
          }
        ];
      }
    },
    updateValueToFile(val) {
      if (val) {
        if (this.maximum > 1) {
          this.updateFileMulti(val);
        } else if (!isEqualWith([val], this.data, this.customizerEqualFile)) {
          this.updateFileSingle(val);
        }
      } else {
        this.files = [];
      }
    },
    getFileTypeByUrl(url) {
      if (!url) {
        return "other";
      } else if (URL_IMAGE_REGEX.test(url)) {
        return "image";
      } else if (URL_VIDEO_REGEX.test(url)) {
        return "video";
      } else if (URL_AUDIO_REGEX.test(url)) {
        return "audio";
      } else {
        return "other";
      }
    },
    handleUploadSuccess(file, res) {
      if (res && res.code === CODE_SUCCESS) {
        const index = lodash.findIndex(this.files, { id: file.id });
        if (index !== -1) {
          this.files.splice(index, 1, {
            ...this.files[index],
            ...file,
            url: res.result.file_url
          });
          this.$emit("upload-success");
        }
      } else {
        this.resError = res.message;
        this.$emit("upload-failed");
        this.removeFile(file.id);
      }
      this.uploading = false;
    },
    handleUploadFail(file, errorMsg, xhrData) {
      this.resError = getErrorMsg(xhrData, "file_upload") || errorMsg;
      this.$emit("upload-failed");
      setTimeout(() => {
        this.removeFile(file.id);
      }, 100);
    },
    clearFile() {
      this.resError = "";
      this.uploader.removeAllFiles(true);
      this.files = [];
      if (this.maximum > 1) {
        this.$emit("input", []);
      } else {
        this.$emit("input", "");
      }
    },
    removeFile(id) {
      this.uploader.files
        .filter(f => f.id !== id)
        .map(this.uploader.removeFile);
      this.files = this.files.filter(f => f.id !== id);
      if (this.files.length === 0) {
        this.tab = "tab-upload-file";
      }
    },
    isString(value) {
      return typeofValue.isString(value);
    },
    isObject(value) {
      return typeofValue.isObject(value);
    },
    isArrayString(value) {
      return typeofValue.isArray(value) && typeofValue.isString(value[0]);
    },
    isArrayObject(value) {
      return typeofValue.isArray(value) && typeofValue.isObject(value[0]);
    },
    addFile(newFile) {
      this.resError = null;
      let dataUrl = "";
      if (newFile.type.includes("image") || newFile.type.includes("video")) {
        dataUrl = URL.createObjectURL(newFile.nativeFile);
      }
      if (this.maximum === this.files.length) {
        this.uploader.files
          .filter(f => f.id !== newFile.id)
          .map(this.uploader.removeFile);

        newFile.file_url = dataUrl;
        this.files = [newFile];
      } else if (this.files.length < this.maximum) {
        newFile.file_url = dataUrl;
        const nameFile = newFile.name;
        let isDuplicate = false;
        if (nameFile) {
          isDuplicate = this.files.some(item => item.name === nameFile);
        }
        if (isDuplicate) {
          this.$toast.error("File đã bị trùng tải lên không thành công");
        } else {
          this.files = [...this.files, newFile];
        }
      }
    }
  }
});

export default FileUpload;
export type FileUploadRef = InstanceType<typeof FileUpload>;
</script>
<style lang="scss">
.v-transmit,
.v-transmit__preview,
.v-transmit__upload-area {
  height: var(--height) !important;
  min-height: var(--height) !important;
}
</style>
