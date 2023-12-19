<template>
  <div v-if="!isEmptyContent">
    {{ contentView }}
    <a
      v-if="isShowViewMore"
      href="javascript:;"
      @click="isViewMore = !isViewMore"
    >
      {{ isViewMore ? "thu gọn" : "xem thêm" }}</a
    >
  </div>
  <div v-else class="v-text-field__details">
    Không có nội dung
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import VueHighlightJS from "vue-highlightjs";
import { truncate } from "lodash";
import { isEmpty } from "~/util/typeof";

// Tell Vue.js to use vue-highlightjs
Vue.use(VueHighlightJS);

interface ComponentData {
  isViewMore: boolean;
}

interface ComponentMethods {}

const ERROR = 10;

const RenderContent = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RenderContent",
  props: {
    content: {
      type: String,
      required: true
    },
    maxLength: {
      type: Number,
      default: 75
    }
  },
  data() {
    return {
      isViewMore: false
    };
  },
  computed: {
    isEmptyContent() {
      return isEmpty(this.content);
    },
    isShowViewMore() {
      if (!this.isEmptyContent) {
        return this.content?.length > ERROR + this.maxLength;
      }
      return false;
    },
    contentView() {
      if (!this.isEmptyContent && this.isShowViewMore && !this.isViewMore) {
        return truncate(this.content, {
          length: this.maxLength,
          separator: " "
        });
      }
      return this.content;
    }
  }
});

export default RenderContent;
export type RenderContentRef = InstanceType<typeof RenderContent>;
</script>
