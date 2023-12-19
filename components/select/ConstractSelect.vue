<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :multiple="multiple"
    name="constract_id"
    label="Gói mua khoán"
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
import Vue, { VueConstructor } from "vue";
import { SelectDataInterface } from "~/interface/components/select";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { CONSTRACT } from "~/constants/resource";
import deepWrapper from "~/mixins/deepWrapper";

const ConstractSelect = (Vue as VueConstructor<
  Vue & SelectDataInterface
>).extend({
  name: "ConstractSelect",
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
      resource: CONSTRACT,
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

export default ConstractSelect;
export type ConstractSelectRef = InstanceType<typeof ConstractSelect>;
</script>
