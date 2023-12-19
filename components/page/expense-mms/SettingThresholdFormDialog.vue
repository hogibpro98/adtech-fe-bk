<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm7 md7 lg5 xl3"
    v-bind="$attrs"
    @on-submit="onSubmit"
    @hidden="hidden"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-select-with-validation
          v-model="item.warning_mode"
          :loading="loading"
          name="warning_mode"
          required
          rules="required"
          label="Chế độ mức tối thiểu ngân sách"
          :items="thresholdModes"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-if="isPercent"
          key="min_threshold_percent"
          v-model="item.min_threshold"
          :loading="loading"
          :decimal="true"
          suffix="%"
          required
          name="min_threshold"
          label="Mức tối thiểu"
          rules="min_value:0|max_value:100"
        />
        <v-number-field-with-validation
          v-else
          key="min_threshold"
          v-model="item.min_threshold"
          :loading="loading"
          suffix="₫"
          name="min_threshold"
          label="Mức tối thiểu"
          required
          rules="min_value:0"
        />
      </v-flex>
      <v-flex xs12 class="mt-4">
        <v-alert type="info">
          Khi lần đầu tiên số dư ví dịch vụ < hoặc = ngưỡng cảnh báo số dư,
          Admin và Agency sẽ nhận được cảnh báo trong phần mềm và qua email.
          Agency sẽ nhận được cảnh báo nếu Admin cấu hình cho hiển thị thông báo
          này đến Agency trong phần Cấu hình chung.
        </v-alert>
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
import GlobalDataInterface from "~/interface/data/global";
import {
  TransactionMMSDailyDetail,
  TransactionRechargeMMSDailyDetail
} from "~/interface/data/expense";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { SettingUserPriceInterface } from "~/interface/data/banner";

const DEFAULT_ITEM = {
  warning_mode: 1,
  min_threshold: null,
  user_id: null,
  service: "mms"
};

interface ComponentData extends GlobalDataInterface {
  DOCUMENT: Array<string>;
  title: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  labelButtonConfirm: string;
  serviceMap: Object;
  isPercent: boolean;
  item: {
    user_id: number;
    warning_mode: number;
    min_threshold: number;
    service: string;
  };
  $agencyPriceRepository: RepositoryInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethods {
  show(
    item: TransactionRechargeMMSDailyDetail | TransactionMMSDailyDetail
  ): void;

  hidden(): void;

  getTypeTransaction(typeTransaction: string): object;
}

const SettingThresholdFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SettingThresholdFormDialog",
  components: {
    VSelectWithValidation,
    VNumberFieldWithValidation,
    FormDialog
  },
  props: {
    service: {
      type: String,
      default: "mms"
    }
  },
  data() {
    return {
      labelButtonConfirm: "",
      isEdit: false,
      timeout: 0,
      loading: false,
      budget: 0,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    title() {
      const service = this.serviceMap[this.service];
      return `Cài đặt cấu hình ngưỡng cảnh báo số dư ${service}`;
    },
    thresholdModes() {
      return [
        {
          text: "Phần trăm",
          value: 1
        },
        {
          text: "Tuyệt đối",
          value: 0
        }
      ];
    },
    serviceMap() {
      return {
        mms: "tin nhắn MMS",
        sms: "tin nhắn SMS",
        redirect: "quảng cáo redirect",
        data: "tài trợ data",
        sms_vendor: "tin nhắn ngoại mạng"
      };
    },
    isPercent() {
      return this.item.warning_mode === 1;
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    async show(item = null) {
      clearTimeout(this.timeout);
      this.item = cloneDeep(DEFAULT_ITEM);
      await this.$nextTick();
      this.item = cloneDeep(item);
      this.labelButtonConfirm = "Cập nhật";
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      this.item = cloneDeep(DEFAULT_ITEM);
      clearTimeout(this.timeout);
    },
    async onSubmit() {
      this.loading = true;

      try {
        const res = await this.$agencyWalletRepository.post("set-warning", {
          ...this.item,
          service: this.service
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("cấu hình ngân sách");
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

export default SettingThresholdFormDialog;
export type SettingThresholdFormDialogRef = InstanceType<
  typeof SettingThresholdFormDialog
>;
</script>
