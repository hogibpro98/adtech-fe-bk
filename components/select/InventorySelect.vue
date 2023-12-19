<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :query-params="{
      sortBy: ['name'],
      sortDesc: [false]
    }"
    name="inventory"
    label="Inventory"
    item-text="name"
    v-on="$listeners"
  >
    <template #item="data">
      <v-list-item-content>
        <v-list-item-title>
          {{ data.item.name }}
          <v-chip class="mx-0 mb-2 px-1" label x-small>
            {{ data.item.type }}
          </v-chip>
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
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { INVENTORY_DISPLAY } from "~/constants/resource";
import { SelectDataInterface } from "~/interface/components/select";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "InventorySelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    }
  },
  data() {
    return {
      resource: INVENTORY_DISPLAY,
      innerValue: null
    };
  }
});
</script>
