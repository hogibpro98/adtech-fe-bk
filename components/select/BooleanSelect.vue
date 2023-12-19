<template>
  <v-select
    v-model="innerValue"
    v-bind="$attrs"
    :items="items"
    item-value="id"
    clearable
    v-on="$listeners"
  ></v-select>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";
import { FALSE, TRUE } from "~/constants/code";
import { SelectDataInterface } from "~/interface/components/select";

const BooleanSelect = (Vue as VueConstructor<Vue & SelectDataInterface>).extend(
  {
    name: "BooleanSelect",
    mixins: [wrapper],
    data() {
      return {
        items: [
          {
            id: TRUE,
            text: "Có"
          },
          {
            id: FALSE,
            text: "Không"
          }
        ]
      };
    }
  }
);

export default BooleanSelect;
export type BooleanSelectRef = InstanceType<typeof BooleanSelect>;
</script>
