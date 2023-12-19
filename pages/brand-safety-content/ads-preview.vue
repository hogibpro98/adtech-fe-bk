<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-tabs v-model="tabSelected">
      <v-tab v-for="tab in tabs" :key="tab.code">
        {{ tab.text }}
      </v-tab>
    </v-tabs>
    <v-tabs-items :value="tabSelected">
      <v-tab-item v-for="tab in tabs" :key="tab.code">
        <div>
          <list-ads-preview :status="tab.code"></list-ads-preview>
        </div>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>
<script lang="ts">
import { BLOCKING_CATEGORY } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import { isEmpty } from "~/util/typeof";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { responseErrorToString } from "~/util/array";
import ListAdsPreview from "~/components/page/ads-preview/ListAdsPreview.vue";

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
}

interface ComponentMethods {
  isEmpty: Function;
  changeStatusCategory: Function;
  refreshTable: Function;
}

const TABS = [
  {
    code: "review",
    text: "Cần xem xét"
  },
  {
    code: "reviewed",
    text: "Đã xem xét"
  },
  {
    code: "reject",
    text: "Bị chặn"
  }
];

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    ListAdsPreview
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
      tabSelected: 0,
      tabs: TABS,
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
