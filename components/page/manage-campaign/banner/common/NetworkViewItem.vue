<template>
  <select-multi-dropdown
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    label="Mạng"
    placeholder="Thêm mạng"
    item-text="name"
    note-message="Mặc định hiển thị với tất cả mạng (Nếu để trống mạng)"
  />
</template>
<script lang="ts">
import { NETWORK } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import SelectMultiDropdown from "~/components/select/SelectMultiDropdown.vue";

interface ComponentData {
  innerValue: Array<object>;
  resource: string;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "NetworkViewItem",
  components: { SelectMultiDropdown },
  mixins: [wrapper],
  data() {
    return {
      innerValue: [],
      resource: NETWORK
    };
  }
});
</script>
