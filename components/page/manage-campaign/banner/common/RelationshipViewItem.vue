<template>
  <select-multi-dropdown
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    label="Tình trạng hôn nhân"
    placeholder="Thêm tình trạng hôn nhân"
    item-text="name"
    note-message="Mặc định hiển thị với tất cả tình trạng hôn nhân (Nếu để trống tình trạng hôn nhân)"
  />
</template>
<script lang="ts">
import { RELATIONSHIP } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import SelectMultiDropdown from "~/components/select/SelectMultiDropdown.vue";

interface ComponentData {
  innerValue: Array<object>;
  resource: string;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "RelationshipViewItem",
  components: { SelectMultiDropdown },
  mixins: [wrapper],
  data() {
    return {
      innerValue: [],
      resource: RELATIONSHIP
    };
  }
});
</script>
