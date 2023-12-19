<template>
  <div>
    <overview-group-table
      v-bind="$attrs"
      :headers="displayHeaders"
      :filter="filterParams"
      :time-range="timeRange"
      :title="title"
      :resource="resource"
      object-name="Vị trí"
      :item-types="itemTypes"
      title-col="name"
      lazy
    >
      <v-row slot="top-right" class="py-2">
        <v-select
          v-model="selectedType"
          class="select-input"
          dense
          :items="itemTypes"
          item-value="value"
          item-text="text"
          label="Dịch vụ"
        >
        </v-select>
        <v-select
          v-model="selectedLevel"
          class="pl-2 select-input"
          dense
          :items="levels"
          item-value="value"
          item-text="text"
          label="Chọn cấp độ"
        ></v-select>
      </v-row>
      <!--      <template slot="item.name" slot-scope="props">-->
      <!--        <nuxt-link :to="`/mmanager-Location`" class="truncate-2">-->
      <!--          {{ props.item.Location.name }}-->
      <!--        </nuxt-link>-->
      <!--      </template>-->
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

const AdsDataByLocationOverview = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "AdsDataByLocationOverview",
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
      selectedType: "",
      selectedLevel: ""
    };
  },
  computed: {
    filterParams() {
      return {
        ...this.filter,
        location_type: this.selectedLevel
      };
    },
    headers() {
      return [
        {
          text: "Số tin đã gửi qua gateway",
          value: ["num_fail", "num_success"],
          children: [
            {
              text: "Số tin đã gửi qua gateway thành công",
              value: "num_success",
              color: "success",
              operator: "sum"
            },
            {
              text: "Số tin đã gửi qua gateway thất bại",
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
        { text: "SMS+MMS", value: "message" }
      ];
    },
    displayHeaders() {
      return this.headers.filter(e => {
        return !this.hideHeaders.includes(e.value);
      });
    },
    levels() {
      return [
        {
          value: "area",
          text: "Khu vực"
        },
        {
          value: "province",
          text: "Tỉnh/Thành phố"
        },
        {
          value: "district",
          text: "Quận/Huyện"
        }
      ];
    },
    title() {
      return "Danh sách tin nhắn  theo vị trí";
    },
    resource() {
      return `demographic/${this.selectedType}/location/listing`;
    }
  },
  created() {
    this.selectedType = "mms";
    this.selectedLevel = "province";
  }
});

export default AdsDataByLocationOverview;
export type AdsDataByLocationOverviewRef = InstanceType<
  typeof AdsDataByLocationOverview
>;
</script>
