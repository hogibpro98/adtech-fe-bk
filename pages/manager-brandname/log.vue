<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <header-select-time
      v-model="date"
      title="Chi tiết log brandname"
      class="sticky-header"
    />
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            resource="log/brandname-log"
            v-bind="$attrs"
            :headers="headers"
            :filter="filterTable"
            :default-pagination="{
              sortBy: ['date'],
              sortDesc: [true]
            }"
            @view-detail="showDetail"
          >
            <template slot="item.date" slot-scope="{ item }">
              {{ item.date | date }}
            </template>
            <template slot="item.brandname.name" slot-scope="{ item }">
              {{ renderName(item) }}
            </template>
          </api-data-table>
          <v-card-text class="no-padding"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <brandname-log-dialog ref="brandnameLogDialog"></brandname-log-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import BrandnameLogDialog from "~/components/page/manage-brandname/log/BrandnameLogDialog.vue";
import HeaderSelectTime from "~/components/common/HeaderSelectTime.vue";

interface ComponentData {}
interface ComponentMethod {}
interface ComponentComputed {}
interface ComponentProps {}

export default Vue.extend<
  ComponentData,
  ComponentMethod,
  ComponentComputed,
  ComponentProps
>({
  name: "Log",
  components: { ApiDataTable, BrandnameLogDialog, HeaderSelectTime },
  layout: "dashboard-without-header",
  permission: false,
  data() {
    return {
      date: []
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Ngày",
          value: "date",
          width: 100,
          align: "center"
        },
        {
          text: "Brandname",
          value: `brandname.name`,
          width: 450
        },
        {
          text: "Hành động",
          value: "action",
          sortable: false,
          width: 200,
          align: "center",
          actions: [
            {
              label: "Chi tiết",
              icon: "visibility",
              color: "primary",
              event: "view-detail"
            }
          ]
        }
      ];
    },
    filterCustom() {
      return {
        time_range: this.$options.filters.sqlDate(this.date)
      };
    },
    filterTable() {
      const filterCustomProps = this.filterCustom || {};
      return {
        ...filterCustomProps
      };
    }
  },
  methods: {
    renderName(item) {
      if (item.brandname) {
        return item.brandname.name;
      } else if (item.brandname_request) {
        return item.brandname_request.name;
      } else {
        return "";
      }
    },
    showDetail(item) {
      this.$refs.brandnameLogDialog.show(item);
    },

  }
});
</script>

<style scoped></style>
