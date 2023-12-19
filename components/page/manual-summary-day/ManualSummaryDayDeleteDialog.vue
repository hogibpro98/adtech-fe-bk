<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Bạn muốn xóa bản ghi?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa bản ghi:
      <div>
        Ngày:
        <span class="red--text"> {{ item.full_date | date }} </span>
      </div>
      <div>
        Agency:
        <span class="red--text"> {{ item.agency_name }} </span>
      </div>
      <div>
        Brandname:
        <span class="red--text"> {{ item.brandname }} </span>
      </div>
      <div>
        Loại tin:
        <span class="red--text"> {{ item.message_type }} </span>
      </div>
      <div>
        Kiểu truyền thông:
        <span class="red--text"> {{ item.ads_type }} </span>
      </div>
      <div>
        Lĩnh vực hoạt động:
        <span class="red--text"> {{ item.cat_id }} </span>
      </div>
      <div>
        Đơn vị quản lý:
        <span class="red--text"> {{ item.manager }} </span>
      </div>
      <div>
        Lượt view:
        <span class="red--text"> {{ item.view }} </span>
      </div>
      <div>
        Lượt click:
        <span class="red--text"> {{ item.click }} </span>
      </div>
      <div>
        Số MT:
        <span class="red--text"> {{ item.num_message_success }} </span>
      </div>
      <div>
        Đơn giá click:
        <span class="red--text"> {{ item.price_click }} đ</span>
      </div>
      <div>
        Đơn giá view:
        <span class="red--text"> {{ item.price_view }} đ</span>
      </div>
      <div>
        Đơn giá MT:
        <span class="red--text"> {{ item.price_num_message_success }} đ</span>
      </div>
      <div>
        Tổng tiền:
        <span class="red--text"> {{ item.total_money }} đ</span>
      </div>
      <div>
        Năm:
        <span class="red--text"> {{ item.year }} </span>
      </div>
      <div>
        Tháng:
        <span class="red--text"> {{ item.month }} </span>
      </div>
      <div>
        Ngày:
        <span class="red--text"> {{ item.date }} </span>
      </div>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { ConfirmDialogRef } from "../../common/ConfirmDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";

interface ComponentData {
  loading: boolean;
  $refs: { refConfirmDialog: ConfirmDialogRef };
  $manageLayoutRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hide: Function;
  deleteItem: Function;
}

const DEFAULT_ITEM = {
  id: null
};

const ManualSummaryDayDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ManualSummaryDayDeleteDialog",
  components: { ConfirmDialog },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  methods: {
    show(item) {
      this.item = item;
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
    },

    async deleteItem() {
      this.loading = true;
      try {
        const res = await this.$axios.$post("manual-summary-day/delete", {
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("bản ghi");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default ManualSummaryDayDeleteDialog;
export type ManualSummaryDayDeleteDialogRef = InstanceType<
  typeof ManualSummaryDayDeleteDialog
>;
</script>
