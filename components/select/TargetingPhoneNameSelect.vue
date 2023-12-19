<template>
  <select-multi-dropdown
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    label="Điện thoại"
    placeholder="Thêm điện thoại"
    item-text="name"
    note-message="Mặc định hiển thị với tất cả điện thoại (Nếu để trống hệ điện thoại)"
  />
</template>
<script lang="ts">
import { PHONE_NAME } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import SelectMultiDropdown from "~/components/select/SelectMultiDropdown";
import { SelectDataInterface } from "~/interface/components/select";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "TargetingPhoneNameSelect",
  components: { SelectMultiDropdown },
  mixins: [wrapper],
  data() {
    return {
      innerValue: [],
      resource: PHONE_NAME
    };
  }
});
</script>
