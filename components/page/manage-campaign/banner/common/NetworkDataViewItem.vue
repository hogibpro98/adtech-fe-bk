<template>
  <select-multi-dropdown
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    label="Data"
    placeholder="Thêm data"
    item-text="name"
    note-message="Mặc định hiển thị với tất cả data (Nếu để trống data)"
  />
</template>
<script lang="ts">
import { NETWORK_DATA } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import SelectMultiDropdown from "~/components/select/SelectMultiDropdown";

interface ComponentData {
  innerValue: Array<object>;
  resource: string;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "NetworkDataViewItem",
  components: { SelectMultiDropdown },
  mixins: [wrapper],
  data() {
    return {
      innerValue: [],
      resource: NETWORK_DATA
    };
  }
});
</script>
