<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <v-tabs v-if="items" vertical>
            <v-tab v-for="(mountain, index) in items" :key="index" lg4>
              {{ mountain.name }}
            </v-tab>
            <v-tab-item v-for="(mountain, index) in items" :key="index" lg8>
              <v-card :loading="loading" class="mx-auto my-12" max-width="600">
                <template slot="progress">
                  <v-progress-linear
                    color="deep-purple"
                    height="10"
                    indeterminate
                  ></v-progress-linear>
                </template>
                <v-card-text style="color: #3f8ba2">Tên chính sách</v-card-text>
                <v-card-title>{{ mountain.name }}</v-card-title>

                <v-card-text style="color: #3f8ba2"
                  >Thời gian áp dụng</v-card-text
                >
                <v-card-text>{{ mountain.created_at }}</v-card-text>

                <v-card-text style="color: #3f8ba2">Mức độ xử phạt</v-card-text>
                <v-card-text>{{ levelMap[mountain.level] || "" }}</v-card-text>

                <v-card-text style="color: #3f8ba2"
                  >Mô tả - Nội dung chính sách</v-card-text
                >
                <v-card-text>{{ mountain.desc }}</v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-flex>
    </v-layout>
    <policy-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></policy-form-dialog>
    <policy-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></policy-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import PolicyFormDialog from "~/components/page/publisher/policy/PolicyFormDialog.vue";
import PolicyDeleteDialog from "~/components/page/publisher/policy/PolicyDeleteDialog.vue";
import { CODE_SUCCESS } from "~/constants/code";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { POLICY_PUBLIC } from "~/constants/resource";
import { ToastInterface } from "~/interface/plugin/toast";

interface ComponentData {
  showing: boolean;
  timeout: number;
  resource: string;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  searchParams: Array<object>;
  startIndex: number;
  $policyRepository: RepositoryInterface;
  $toast: ToastInterface;
  loading: boolean;
}

interface ComponentMethods {
  addItem: Function;
  editItem: Function;
  deleteItem: Function;
  refreshTable: Function;
  changeStatus: Function;
}

let index = 1;

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    PolicyDeleteDialog,
    PolicyFormDialog
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
      resource: POLICY_PUBLIC,
      objectName: "policy",
      searchParams: null,
      startIndex: 0,
      loading: false,
      items: []
    };
  },
  async fetch() {
    this.loading = true;
    index = index + 1;
    const indexFetch = index;
    try {
      const res = await this.$policyRepository.list({
        resource_status: "approve"
      });
      if (indexFetch === index) {
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.items = res.data;
        } else {
          this.$toast.global.action_fail();
        }
      }
    } catch (e) {
      this.loading = false;
      this.$toast.global.action_fail();
    }
  },
  computed: {
    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);

      return toolbarShow;
    },
    levelMap() {
      return {
        lock_payment: "Giữ tiền quảng cáo",
        lock_inventory: "Khóa phân phối cho inventory",
        warning: "Cảnh cáo"
      };
    },
    isLoadingChangeStatus() {
      return Object.keys(this.loading).some(key => !!this.loading[key]);
    }
  },
  methods: {
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    }
  }
});
</script>
