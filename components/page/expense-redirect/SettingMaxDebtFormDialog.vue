<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm7 md7 lg5 xl3"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="item.price_cpm"
          :loading="loading"
          :decimal="false"
          suffix="₫"
          name="price_cpm"
          type="text"
          label="Đơn giá CPM"
          hint="Đơn giá cho 1000 view"
          required
          rules="required|min_value:0"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="item.price_cpc"
          :loading="loading"
          :decimal="false"
          suffix="₫"
          name="price_cpc"
          type="text"
          label="Đơn giá CPC"
          hint="Đơn giá cho 1 click"
          required
          rules="required|min_value:0"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="item.max_debt"
          :loading="loading"
          :decimal="false"
          suffix="₫"
          name="max_debt"
          type="text"
          label="Ngân sách giới hạn"
          rules="min_value:0"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-select-with-validation
          v-model="item.min_threshold_mode"
          :loading="loading"
          name="min_threshold_mode"
          required
          rules="required"
          label="Chế độ mức tối thiểu ngân sách"
          :items="thresholdModes"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-if="isPercent"
          key="threshold_percent"
          v-model="item.threshold_percent"
          :loading="loading"
          :decimal="true"
          suffix="%"
          required
          name="threshold_percent"
          label="Mức tối thiểu"
          rules="required|min_value:0|max_value:100"
        />
        <v-number-field-with-validation
          v-else
          key="threshold_number"
          v-model="item.threshold_number"
          :loading="loading"
          suffix="₫"
          name="threshold_number"
          label="Mức tối thiểu"
          required
          rules="required|min_value:0"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import cloneDeep from "lodash/cloneDeep";
import VSelectWithValidation from "@/components/common/VSelectWithValidation.vue";
import Vue, { VueConstructor } from "vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { SettingUserPriceInterface } from "~/interface/data/banner";
import { DataSelectInterface } from "~/interface/data/dataSelect";

const DEFAULT_ITEM = {
  price_cpm: null,
  price_cpc: null,
  threshold_percent: null,
  threshold_number: null
};

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  budget: number;
  item: SettingUserPriceInterface;
  thresholdModes: Array<DataSelectInterface>;
  isPercent: boolean;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethods {
  show(item: SettingUserPriceInterface): void;
  hidden(): void;
  onSubmit(): void;
}

const SettingMaxDebtFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SettingMaxDebtFormDialog",
  components: {
    VSelectWithValidation,
    VNumberFieldWithValidation,
    FormDialog
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      budget: 0,
      item: cloneDeep(DEFAULT_ITEM),
      thresholdModes: [
        {
          text: "Phần trăm",
          value: "percent"
        },
        {
          text: "Tuyệt đối",
          value: "number"
        }
      ]
    };
  },
  computed: {
    isPercent() {
      return this.item.min_threshold_mode === "percent";
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      clearTimeout(this.timeout);
      this.item = cloneDeep(item);

      this.title = "Cài đặt ngân sách quảng cáo Redirect";
      this.labelButtonConfirm = "Cập nhật";
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    async onSubmit() {
      this.loading = true;

      try {
        const res = await this.$agencyPriceRepository.post("save", this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("ngân sách");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e?.response?.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    }
  }
});

export default SettingMaxDebtFormDialog;
export type SettingMaxDebtFormDialogRef = InstanceType<
  typeof SettingMaxDebtFormDialog
>;
</script>
