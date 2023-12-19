<template>
  <form-dialog
    ref="refFormDialog"
    v-bind="$attrs"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm7 md7 lg5 xl4"
    v-on="$listeners"
    @on-submit="onSubmit"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <custom-date-picker
          v-model="item.date"
          :loading="loading"
          name="date"
          type="text"
          label="Ngày nạp tiền"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="item.amount"
          :loading="loading"
          suffix="₫"
          name="amount"
          type="text"
          label="Số tiền thu"
          required
          rules="required|max:14"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.note"
          :loading="loading"
          name="note"
          label="Nội dung"
          rows="3"
          rules="max:500"
          counter="500"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import CustomDatePicker from "@/components/common/CustomDatePicker.vue";
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import cloneDeep from "lodash/cloneDeep";
// @ts-ignore
import moment from 'moment/src/moment';
import Vue, { VueConstructor } from "vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { SettingUserPriceInterface } from "~/interface/data/banner";
import { RechargeExpenseInterface } from "~/interface/data/expense";
import GlobalDataInterface from "~/interface/data/global";

const DEFAULT_ITEM = {
  user_id: null,
  date: moment(Date.now()).format("YYYY/MM/DD"),
  amount: "",
  note: ""
};

interface ComponentData extends GlobalDataInterface {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  budget: number;
  item: SettingUserPriceInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethods {
  show(item: SettingUserPriceInterface): void;
  convertDataToUpdate(
    item: SettingUserPriceInterface
  ): RechargeExpenseInterface;
  hidden(): void;
  onSubmit(): void;
}

const RedirectRechargeFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RedirectRechargeFormDialog",
  components: {
    CustomDatePicker,
    VNumberFieldWithValidation,
    FormDialog,
    VTextAreaWithValidation
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      budget: 0,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      clearTimeout(this.timeout);
      this.item = cloneDeep(item);

      this.title = "Cập nhật tiền quảng cáo đã thu";
      this.labelButtonConfirm = "Cập nhật";
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    convertDataToUpdate(item) {
      return {
        date: this.$filters.getTime(item.date),
        user_id: item.user_id,
        amount: item.amount,
        note: item.note
      };
    },
    async onSubmit() {
      this.loading = true;

      try {
        const res = await this.$rechargeRedirectRepository.create(
          this.convertDataToUpdate(this.item)
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("số tiền đã thu");
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

export default RedirectRechargeFormDialog;
export type RedirectRechargeFormDialogRef = InstanceType<
  typeof RedirectRechargeFormDialog
>;
</script>
