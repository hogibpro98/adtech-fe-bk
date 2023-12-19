<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            v-model="selectedItems"
            :resource="resource"
            :headers="headerShow"
            :filter="searchParams"
            :start-index.sync="startIndex"
            page-name="setting-display-ads-tag"
            calculate-widths
            @fetched-data="fetchedDataTable"
          >
            <template slot="item.name" slot-scope="{ item }">
              <div>
                {{ item.name }}
                <v-tooltip v-if="!!item.description" bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon v-bind="attrs" small class="pr-2" v-on="on"
                      >info</v-icon
                    >
                  </template>
                  <span>{{ item.description }}</span>
                </v-tooltip>
              </div>
            </template>
            <template slot="item.status" slot-scope="{ item }">
              <div class="d-flex align-items-center py-2">
                <span style="width: 100px; text-align: end">
                  {{
                    (loading[item.id]
                    ? isEmpty(item.users)
                    : !isEmpty(item.users))
                      ? "Bị chặn"
                      : "Được phép"
                  }}
                </span>
                <v-switch
                  :input-value="!isEmpty(item.users)"
                  :disabled="isLoadingChangeStatus"
                  class="d-inline-flex px-0 py-0 my-0 ml-2"
                  hide-details
                  dense
                  @click="changeStatusCategory(item.id, isEmpty(item.users))"
                ></v-switch>
                <v-progress-circular
                  v-if="!!loading[item.id]"
                  indeterminate
                  size="20"
                  color="primary"
                ></v-progress-circular>
              </div>
            </template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import { BLOCKING_CATEGORY } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import { isEmpty } from "~/util/typeof";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { responseErrorToString } from "~/util/array";

interface ComponentData {
  showing: boolean;
  timeout: number;
  resource: string;
  loading: object;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  searchParams: Array<object>;
  startIndex: number;
  $blockingCategoryRepository: RepositoryInterface;
  $refs: {
    table: ApiDataTableRef;
  };
}

interface ComponentMethods {
  isEmpty: Function;
  changeStatusCategory: Function;
  refreshTable: Function;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  layout: "dashboard",
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
      resource: BLOCKING_CATEGORY,
      searchParams: null,
      loading: {},
      startIndex: 0
    };
  },
  computed: {
    isLoadingChangeStatus() {
      return Object.keys(this.loading).some(key => !!this.loading[key]);
    },
    headerShow() {
      const isEditable = this.$pageCan("edit");
      if (isEditable) {
        return [
          {
            text: "Tag",
            value: "name"
          },
          {
            text: "Trạng thái",
            value: "status",
            width: 250,
            sortable: false
          }
        ];
      }

      return [
        {
          text: "Tag",
          value: "name"
        }
      ];
    }
  },
  methods: {
    isEmpty(value) {
      return isEmpty(value);
    },
    fetchedDataTable() {
      this.loading = {};
    },
    async changeStatusCategory(categoryId, newStatus) {
      this.loading = {
        ...this.loading,
        [categoryId]: true
      };

      try {
        const res = await this.$blockingCategoryRepository.changeStatus({
          id: categoryId,
          status: newStatus ? "block" : "unblock"
        });
        this.refreshTable();
        if (res.code !== CODE_SUCCESS) {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.refreshTable();
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    }
  }
});
</script>
