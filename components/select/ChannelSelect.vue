<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :query-params="{
      sortBy: ['name'],
      sortDesc: [false],
      resource_inventory_id: inventoryId
    }"
    name="channel"
    label="Sub-inventory"
    item-text="name"
    v-on="$listeners"
  >
    <template #item="data">
      <v-list-item-content>
        <v-list-item-title>
          {{ data.item.name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ data.item.url }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { SelectDataInterface } from "../../interface/components/select";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { CHANNEL } from "~/constants/resource";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "ChannelSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    inventoryId: {
      type: [String, Number],
      default: undefined
    }
  },
  data() {
    return {
      resource: CHANNEL,
      innerValue: null
    };
  }
});
</script>
