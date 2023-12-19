<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm8 md8 lg5 xl4"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <agency-advertiser-select
          v-model="item.enterprise"
          :loading="loading"
          name="enterprise"
          rules="required"
          required
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.channel"
          :loading="loading"
          rules="required|max:100"
          name="channel"
          type="text"
          label="Kênh"
          required
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.saleid"
          :loading="loading"
          rules="required|max:100"
          name="saleid"
          type="text"
          label="Mã nhân viên thực hiện"
          required
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="item.amount"
          :loading="loading"
          name="amount"
          :decimal="false"
          suffix="₫"
          required
          rules="required"
          label="Số tiền"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.transid"
          :loading="loading"
          :counter="100"
          rules="max:100"
          name="transid"
          type="text"
          label="Mã giao dịch"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.reason"
          :loading="loading"
          :counter="500"
          rules="max:500|required"
          required
          name="reason"
          type="text"
          label="Lý do nạp tiền"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "~/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { DeviceInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: DeviceInterface;
  $refs: { refFormDialog: FormDialogRef };
  $rechargeOrderRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hidden: Function;
  editItem: Function;
  addItem: Function;
  onSubmit: Function;
}

const DEFAULT_ITEM = {
  saleid: "",
  channel: "",
  transid: "",
  enterprise: null,
  enterpriseid: null
};

/**
 * @property {Object} $rechargeOrderRepository
 */

const RechargeOrderFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RechargeOrderFormDialog",
  components: {
    VTextAreaWithValidation,
    VNumberFieldWithValidation,
    AgencyAdvertiserSelect,
    FormDialog,
    VTextFieldWithValidation
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      clearTimeout(this.timeout);

      this.isEdit = false;
      this.item = cloneDeep(DEFAULT_ITEM);

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} đơn hàng nạp tiền`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    onSubmit() {
      this.addItem();
    },
    mapData() {
      const item = cloneDeep(this.item);
      item.enterpriseid = item.enterprise?.id;

      return item;
    },

    async addItem() {
      this.loading = true;
      try {
        const item = this.mapData();
        const res = await this.$rechargeOrderRepository.create(item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("đơn hàng nạp tiền");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    }
  }
});

export default RechargeOrderFormDialog;
export type RechargeOrderFormDialogRef = InstanceType<
  typeof RechargeOrderFormDialog
>;
</script>
