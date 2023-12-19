<template>
  <select-multi-dropdown
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    label="Giới tính"
    placeholder="Thêm giới tính"
    item-text="name"
    note-message="Mặc định hiển thị với tất cả giới tính (Nếu để trống giới tính)"
  />
</template>
<script lang="ts">
import { GENDER } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import SelectMultiDropdown from "~/components/select/SelectMultiDropdown.vue";

interface ComponentData {
  innerValue: Array<object>;
  resource: string;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "GenderViewItem",
  components: { SelectMultiDropdown },
  mixins: [wrapper],
  data() {
    return {
      innerValue: [],
      resource: GENDER
    };
  }
});
</script>
