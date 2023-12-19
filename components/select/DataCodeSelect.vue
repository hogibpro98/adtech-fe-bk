<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :multiple="multiple"
    :name="name"
    label="Mã gói data"
    item-text="code"
    item-value="code"
    v-on="$listeners"
  >
    <template slot="selection" slot-scope="{ item }">
      <v-chip
        v-if="multiple"
        class="mx-1"
        color="primary"
        small
        close
        @click:close="remove(item)"
      >
        {{ item.code }}
      </v-chip>
      <span v-else>{{ item.code }}</span>
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { SelectDataInterface } from "~/interface/components/select";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { DATA_CODE } from "~/constants/resource";
import deepWrapper from "~/mixins/deepWrapper";
import wrapper from "~/mixins/wrapper";

const DataCodeSelect = (Vue as VueConstructor<
  Vue & SelectDataInterface
>).extend({
  name: "DataCodeSelect",
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
    },
    name: {
      type: String,
      default: "datacode"
    }
  },
  data() {
    return {
      resource: DATA_CODE,
      innerValue: null
    };
  },
  methods: {
    remove(item) {
      let map = [];
      if (this.$attrs["return-object"] == false) {
        map = this.innerValue;
      } else {
        map = this.innerValue.map(e => e.id);
      }

      const index = map.indexOf(item.id);
      this.innerValue.splice(index, 1);
    }
  }
});

export default DataCodeSelect;
export type DataCodeSelectRef = InstanceType<typeof DataCodeSelect>;
</script>
