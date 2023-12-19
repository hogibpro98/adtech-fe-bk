<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :label="label"
    :name="name"
    item-text="name"
    item-value="id"
    v-on="$listeners"
  >
    <template #item="data">
      <v-list-item-content>
        <v-list-item-title>
          {{ data.item.name }}
          <span v-if="data.item.parent"> - {{ data.item.parent.name }} </span>
        </v-list-item-title>
      </v-list-item-content>
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import ApiSelectWithValidation from "@/components/common/ApiSelectWithValidation.vue";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { LOCATION } from "~/constants/resource";
import { SelectDataInterface } from "~/interface/components/select";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "LocationSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String],
      default: null
    },
    label: {
      type: String,
      default: "Vị trí"
    },
    name: {
      type: String,
      default: "location"
    }
  },
  data() {
    return {
      resource: LOCATION,
      innerValue: null
    };
  }
});
</script>
