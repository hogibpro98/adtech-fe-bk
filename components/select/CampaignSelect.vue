<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    name="campaign"
    label="Chiến dịch"
    item-text="name"
    v-on="$listeners"
  >
    <template #item="data">
      <v-list-item-content class="py-2">
        <div :class="`${data.attrs.disabled ? 'opacity-50' : ''}`">
          <v-chip
            v-if="getStatusByCode(data.item.status)"
            class="mx-0 mb-0 px-1"
            :color="getStatusByCode(data.item.status).color"
            label
            x-small
          >
            {{ getStatusByCode(data.item.status).text }}
          </v-chip>
          <v-chip v-if="showPrice" class="mx-0 mb-0 px-1" label x-small>
            Ngân sách còn {{ data.item.remain_budget_create_ads | currency }}
          </v-chip>
        </div>
        <v-list-item-title>
          {{ data.item.name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          Người sở hữu: {{ getOwner(data.item) }}
        </v-list-item-subtitle>
        <v-list-item-subtitle
          v-if="checkCampaign(data.item) || !showPrice"
          :class="`${data.attrs.disabled ? 'opacity-50' : ''}`"
        >
          <template v-if="data.item.start_time === data.item.end_time">
            Trong ngày {{ data.item.start_time | date }}
          </template>
          <template v-else>
            Từ {{ data.item.start_time | date }} đến
            {{ data.item.end_time | date }}
          </template>
        </v-list-item-subtitle>
        <v-list-item-subtitle
          v-else
          :class="`${data.attrs.disabled ? 'opacity-50' : ''}`"
        >
          Ngân sách chiến dịch đã hết
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import ApiSelectWithValidation from "@/components/common/ApiSelectWithValidation.vue";
import { STATUS_CAMPAIGN } from "@/constants/dataSelect";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { CAMPAIGN } from "~/constants/resource";
import { SelectDataInterface } from "~/interface/components/select";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "CampaignSelect",
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
      resource: CAMPAIGN,
      innerValue: null
    };
  },
  methods: {
    getStatusByCode(code) {
      return STATUS_CAMPAIGN.find(s => s.value === code) || {};
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
