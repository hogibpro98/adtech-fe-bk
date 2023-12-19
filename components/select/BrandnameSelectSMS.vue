<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    name="brandname"
    label="Brandname"
    item-text="name"
    v-on="$listeners"
    :query-params = "queryParams"
  >
    <template #item="data">
      <v-list-item-content class="py-2">
        <div :class="`${data.attrs.disabled ? 'opacity-50' : ''}`">


          <v-chip v-if="showPrice" class="mx-0 mb-0 px-1" label x-small>
            Ngân sách còn {{ data.item.remain_budget_create_ads | currency }}
          </v-chip>
        </div>
        <v-list-item-title>
          {{ data.item.name }}
          <v-chip
            v-if="getStatusByCode(data.item.status) && !data.item.deleted_at"
            class="mx-0 mb-0 px-1"
            :color="getStatusByCode(data.item.status).color"
            label
            x-small
          >
            {{ getStatusByCode(data.item.status).text }}
          </v-chip>
          <v-chip
            v-if="getStatusByCode(data.item.status) && data.item.deleted_at"
            class="mx-0 mb-0 px-1"
            color="default"
            label
            x-small
          >
            Đã xóa
          </v-chip>
        </v-list-item-title>

        <v-list-item-subtitle v-if="data.item.deleted_at">
          Xóa ngày: {{ data.item.deleted_at | date }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import ApiSelectWithValidation from "@/components/common/ApiSelectWithValidation.vue";
import {STATUS_BRANDNAME, STATUS_CAMPAIGN} from "@/constants/dataSelect";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import {BRAND_NAME, CAMPAIGN} from "~/constants/resource";
import { SelectDataInterface } from "~/interface/components/select";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "BrandnameSelectSMS",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array],
      default: null
    },
    showPrice: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      resource: BRAND_NAME,
      innerValue: null,
      queryParams: {
        custom_deleted_at: 1
      }
    };
  },
  methods: {
    getStatusByCode(code) {
      return STATUS_BRANDNAME.find(s => s.value === code) || {};
    },
    getOwner(item) {
      if (item.advertiser) {
        return item.advertiser.full_name;
      }
      if (item.agency) {
        return item.agency.full_name;
      }
      return "Đã bị xóa";
    },
    checkCampaign(item) {
      const priceCpm = item?.price?.price_cpm || 0;
      const priceCPMInit = priceCpm / 1000;
      return item?.remain_budget_create_ads > priceCPMInit;
    }
  }
});
</script>
