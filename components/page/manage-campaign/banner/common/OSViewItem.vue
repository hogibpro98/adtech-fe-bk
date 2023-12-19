<template>
  <select-multi-dropdown
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    label="Hệ điều hành"
    placeholder="Thêm hệ điều hành"
    item-text="name"
    note-message="Mặc định hiển thị với tất cả hệ điều hành (Nếu để trống hệ điều hành)"
  />
</template>
<script lang="ts">
import { OS } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import SelectMultiDropdown from "~/components/select/SelectMultiDropdown.vue";

interface ComponentData {
  innerValue: Array<object>;
  resource: string;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "OSViewItem",
  components: { SelectMultiDropdown },
  mixins: [wrapper],
  data() {
    return {
      innerValue: [],
      resource: OS
    };
  }
});
</script>
