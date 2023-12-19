<template>
  <div>
    <overview-group-table
      v-bind="$attrs"
      :headers="displayHeaders"
      :filter="filter"
      :time-range="timeRange"
      :title="title"
      :resource="resource"
      object-name="Brandname"
      :item-types="itemTypes"
      title-col="name"
      lazy
    >
      <v-select
        slot="top-right"
        v-model="selectedType"
        style="width: 200px"
        dense
        :items="itemTypes"
        item-value="value"
        item-text="text"
        class="select-input"
        label="Dịch vụ"
      >
      </v-select>
      <template slot="item.name" slot-scope="{ item }">
        <nuxt-link
          v-if="item.brandname"
          :to="`/manager-brandname/list?keyword=${item.brandname.name}`"
          class="truncate-2"
        >
          {{ item.brandname.name }}
        </nuxt-link>
      </template>
    </overview-group-table>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import GlobalDataInterface from "~/interface/data/global";
import OverviewGroupTable from "~/components/table/OverviewGroupTable.vue";

interface ComponentData extends GlobalDataInterface {
  headers: Array<DataTableHeader>;
}

interface ComponentMethods {}

const AdsDataByBrandnameOverview = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "AdsDataByBrandnameOverview",
  components: { OverviewGroupTable },
  props: {
    filter: {
      type: Object,
      default: () => {}
    },
    timeRange: {
      type: Array,
      default: () => []
    },
    hideHeaders: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedType: ""
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Số tin đã gửi qua gateway",
          value: ["num_fail", "num_success"],
          children: [
            {
              text: "Số tin đã gửi đến gateway thành công",
              value: "num_success",
              color: "success",
              operator: "sum"
            },
            {
              text: "Số tin đã gửi đến gateway thất bại",
              value: "num_fail",
              color: "error",
              operator: "sum"
            },
            {
              text: "Số tin đã gửi",
              value: "num_sent",
              color: "primary",
              operator: "sum",
              visible: false
            }
          ],
          width: 250
        },
        {
          text: "Số tin gửi tới thiết bị",
          value: ["cdr_num_fail", "cdr_num_success"],
          children: [
            {
              text: "Số tin đã gửi tới thiết bị thành công",
              value: "cdr_num_success",
              color: "success",
              operator: "sum"
            },
            {
              text: "Số tin đã gửi tới thiết bị thất bại",
              value: "cdr_num_fail",
              color: "error",
              operator: "sum"
            },
            {
              text: "Số tin đã gửi qua gateway",
              value: "cdr_num_sent",
              color: "primary",
              operator: "sum",
              formatter: item => {
                return item.cdr_num_fail + item.cdr_num_success;
              },
              visible: false
            }
          ],
          width: 150
        }
      ];
    },
    itemTypes() {
      return [
        { text: "SMS", value: "sms" },
        { text: "MMS", value: "mms" },
        { text: "SMS + MMS", value: "message" }
      ];
    },
    displayHeaders() {
      return this.headers.filter(e => {
        return !this.hideHeaders.includes(e.value);
      });
    },
    title() {
      return "Kết quả tin nhắn theo brandname";
    },
    resource() {
      return `/ads-${this.selectedType}/group-brandname/listing`;
    }
  },
  created() {
    this.selectedType = "mms";
  }
});

export default AdsDataByBrandnameOverview;
export type AdsDataByBrandnameOverviewRef = InstanceType<
  typeof AdsDataByBrandnameOverview
>;
</script>
