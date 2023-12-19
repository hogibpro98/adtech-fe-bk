<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :label="label"
    :query-params="params"
    name="service"
    item-text="display_name"
    item-value="name"
    :return-object="returnObject"
    :required="required"
    v-on="$listeners"
  >
    <template #item="{ item }">
      <v-list-item-content v-if="item">
        <v-list-item-title v-if="item.display_name">
          {{ item.display_name }}
        </v-list-item-title>
        <v-list-item-subtitle v-if="item.description">
          {{ item.description }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot :name="name" v-bind="slotData" />
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import { AGENCY_ADVERTISER } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { SelectDataInterface } from "~/interface/components/select";

const ApiSelectService = (Vue as VueConstructor<
  Vue & SelectDataInterface
>).extend({
  name: "ApiSelectService",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    label: {
      type: String,
      default: "Dịch vụ"
    },
    queryParams: {
      type: Object,
      default: () => ({ })
    },
    returnObject: {
      type: Boolean,
      default: true
    },
    required: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      resource: "/service",
      innerValue: null
    };
  },
  computed: {
    params() {
      return {
        ...this.queryParams
      };
    }
  }
});

export default ApiSelectService;
export type ApiSelectServiceRef = InstanceType<typeof ApiSelectService>;
</script>
