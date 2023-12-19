<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :multiple="multiple"
    :resource="resource"
    :query-params="{
      sortBy: ['file_name'],
      sortDesc: [false]
    }"
    label="File báo cáo"
    item-text="file_name"
    v-on="$listeners"
  >
    <template v-if="multiple" slot="selection" slot-scope="{ item }">
      <v-chip class="mx-1" small close @click:close="remove(item)">
        {{ item.file_name }}
      </v-chip>
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { SelectDataInterface } from "../../interface/components/select";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { FILE_REPORT } from "~/constants/resource";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "FileReportSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      resource: FILE_REPORT,
      innerValue: null
    };
  },
  methods: {
    remove(item) {
      this.innerValue.splice(this.innerValue.indexOf(item), 1);
      this.innerValue = [...this.innerValue];
    }
  }
});
</script>
