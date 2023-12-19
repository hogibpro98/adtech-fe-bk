<template>
  <select-multi-dropdown
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    label="Thiết bị sử dụng"
    placeholder="Thêm thiết bị sử dụng"
    item-text="name"
    note-message="Mặc định hiển thị với thiết bị sử dụng (Nếu để trống thiết bị sử dụng)"
  />
</template>
<script lang="ts">
import { DEVICE } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import SelectMultiDropdown from "~/components/select/SelectMultiDropdown.vue";

interface ComponentData {
  innerValue: Array<object>;
  resource: string;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "DeviceViewItem",
  components: { SelectMultiDropdown },
  mixins: [wrapper],
  data() {
    return {
      innerValue: [],
      resource: DEVICE
    };
  }
});
</script>
