<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :multiple="multiple"
    name="brandname"
    label="Brandname"
    item-text="name"
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
        {{ item.name }}
      </v-chip>
      <span v-else>{{ item.name }}</span>
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { pullAllBy } from "lodash";
import { SelectDataInterface } from "~/interface/components/select";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { BRAND_NAME } from "~/constants/resource";
import deepWrapper from "~/mixins/deepWrapper";

const BrandnameSelect = (Vue as VueConstructor<
  Vue & SelectDataInterface
>).extend({
  name: "BrandnameSelect",
  components: { ApiSelectWithValidation },
  mixins: [deepWrapper],
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
      resource: BRAND_NAME,
      innerValue: null
    };
  },
  methods: {
    remove(item) {
      let map = [];

      map = this.innerValue.map(e => e.id);

      const index = map.indexOf(item.id);
      if (index !== -1) {
        this.innerValue.splice(index, 1);
      }
    }
  }
});

export default BrandnameSelect;
export type BrandnameSelectRef = InstanceType<typeof BrandnameSelect>;
</script>
