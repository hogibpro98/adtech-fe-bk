<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :label="label"
    :query-params="params"
    name="owner"
    item-text="full_name"
    v-on="$listeners"
  >
    <template #item="{ item }">
      <v-list-item-content v-if="item">
        <template v-if="isShowParent">
          <v-list-item-title>
            {{ item.full_name }}
            <v-chip class="ml-1 mr-0 mb-2 px-1" label x-small>
              {{ item.is_agency === false ? "advertiser" : "agency" }}
            </v-chip>
          </v-list-item-title>
          <v-list-item-subtitle v-if="item.agency">
            Agency quản lý: {{ item.agency.full_name }}
          </v-list-item-subtitle>
        </template>
        <template v-else>
          <v-list-item-title>
            {{ item.full_name }}
          </v-list-item-title>
        </template>
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

const AgencyAdvertiserSelect = (Vue as VueConstructor<
  Vue & SelectDataInterface
>).extend({
  name: "AgencyAdvertiserSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    label: {
      type: String,
      default: "Người sở hữu"
    },
    isShowParent: {
      type: Boolean,
      default: true
    },
    queryParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      resource: AGENCY_ADVERTISER,
      innerValue: null
    };
  },
  computed: {
    params() {
      return {
        sortBy: ["full_name"],
        sortDesc: [false],
        ...this.queryParams
      };
    }
  }
});

export default AgencyAdvertiserSelect;
export type AgencyAdvertiserSelectRef = InstanceType<
  typeof AgencyAdvertiserSelect
>;
</script>
