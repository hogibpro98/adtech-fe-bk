<template>
  <select-multi-dropdown
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    label="Gói cước sử dụng"
    placeholder="Thêm gói cước sử dụng"
    item-text="name"
    note-message="Mặc định hiển thị với tất cả gói cước sử dụng (Nếu để trống gói cước sử dụng)"
  />
</template>
<script lang="ts">
import { SERVICE_PACKAGE } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import SelectMultiDropdown from "~/components/select/SelectMultiDropdown";

interface ComponentData {
  innerValue: Array<object>;
  resource: string;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "ServicePackageViewItem",
  components: { SelectMultiDropdown },
  mixins: [wrapper],
  data() {
    return {
      innerValue: [],
      resource: SERVICE_PACKAGE
    };
  }
});
</script>
