<template>
  <v-flex lg12 class="no-padding">
    <v-card>
      <api-data-table
        ref="table"
        :headers="headers"
        :toolbar="toolbarShow"
        :filter="searchParams"
        :resource="resource"
        :start-index.sync="startIndex"
        @add-item="addItem"
        @edit-item="editItem"
        @delete-item="deleteItem"
      >
        <template slot="item.ads.name" slot-scope="{ item }">
          <nuxt-link
            v-if="item.ads"
            :to="`/manage-ads/list-ads-redirect/${item.ads.id}`"
            class="truncate-2 w-full block"
          >
            {{ item.ads.name }}
          </nuxt-link>
        </template>
      </api-data-table>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import { ApiDataTableRef } from "~/components/table/ApiDataTable";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { TEXT } from "~/constants/filterType";
import { SURVEY_ANSWER } from "~/constants/resource";

interface ComponentData {
  showing: boolean;
  timeout: number;
  $refs: {
    resource: string;
    filters: Array<object>;
    searchParams: Array<object>;
    headers: DataTableHeader[];
    startIndex: number;
    table: ApiDataTableRef;
  };
}

interface ComponentMethods {
  addItem: Function;
  editItem: Function;
  deleteItem: Function;
  refreshTable: Function;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    ApiDataTable
  },
  props: {
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true
      })
    }
  },
  data() {
    return {
      selectedItems: [],
      searchParams: null,
      filters: [
        {
          type: TEXT,
          name: "type",
          label: "Loại"
        }
      ],
      headers: [
        {
          text: "Quảng cáo",
          value: "ads.name",
          width: 250
        },
        {
          text: "Câu trả lời",
          value: "answer",
          width: 250
        },
        {
          text: "Số điện thoại",
          value: "phone_number",
          width: 250
        },
        {
          text: "Địa chỉ IP",
          value: "ipv4",
          width: 250
        },
        {
          text: "Câu hỏi",
          value: "surveys.question",
          width: 250
        },
        {
          text: "Ngày thực hiện khảo sát",
          value: "created_at",
          width: 250
        }
      ],
      startIndex: 0
    };
  },
  computed: {
    toolbarShow() {
      return this.toolbar;
    },
    resource() {
      return SURVEY_ANSWER;
    }
  }
});
</script>

<style scoped>

</style>