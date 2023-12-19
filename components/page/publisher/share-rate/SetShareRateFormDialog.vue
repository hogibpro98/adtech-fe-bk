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
          v-model="item.rate"
          :loading="loading"
          :decimal="true"
          suffix="%"
          name="rate"
          type="text"
          label="Tỉ lệ chia sẽ doanh thu"
          required
          rules="required|min_value:0|max_value:100"
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
  user_id: null,
  rate: null
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

const SetShareRateFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SetShareRateFormDialog",
  components: {
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
      item: cloneDeep(DEFAULT_ITEM)
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

      this.title = "Cài đặt đơn giá quảng cáo Redirect";
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
        const res = await this.$axios.$post(
          "/publisher/share-rate/update",
          this.item
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("tỉ lệ chia sẻ doanh thu");
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

export default SetShareRateFormDialog;
export type SetShareRateFormDialogRef = InstanceType<
  typeof SetShareRateFormDialog
>;
</script>
