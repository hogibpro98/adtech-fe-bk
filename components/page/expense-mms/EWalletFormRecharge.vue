<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :loading="loading"
    v-bind="$attrs"
    label-button-confirm="Xác nhận"
    content-class="flex xs12 md9 lg7 xl5"
    @on-submit="onSubmit"
    @hidden="hidden"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12>
        <agency-advertiser-select
          v-model="agency"
          :query-params="{
            type: 'agency'
          }"
          :loading="loading"
          :clearable="false"
          :disabled="!authIsAdmin"
          name="agency_id"
          label="Agency"
          required
          rules="required"
        />
      </v-flex>
      <v-flex v-if="isEdit" xs12>
        <v-text-field-with-validation
          v-model="item.code"
          :loading="loading"
          disabled
          name="code"
          type="text"
          label="Mã đơn hàng"
        />
      </v-flex>

      <v-flex xs12 sm6 class="pr-sm-2">
        <v-text-field-with-validation
          v-model="item.trans_id"
          :loading="loading"
          name="trans_id"
          rules="max:100"
          type="text"
          label="Mã nạp tiền ví 511"
        />
      </v-flex>

      <v-flex xs12 sm6 class="pl-sm-2">
        <v-number-field-with-validation
          v-model="item.price"
          :loading="loading"
          name="price"
          type="text"
          label="Giá trị sử dụng"
          suffix="₫"
          required
          rules="required|max_value:2000000000"
        />
      </v-flex>
      <v-flex xs6 class="pr-2">
        <v-number-field-with-validation
          v-model="item.bonus"
          :loading="loading"
          name="bonus"
          prefix=""
          type="text"
          label="Chiết khấu"
          suffix="₫"
        />
      </v-flex>
      <v-flex xs6 class="pl-2">
        <v-number-field-with-validation
          v-model="item.bonus_percent"
          :loading="loading"
          name="bonus_percent"
          hint="Nhập một trong hai giá trị chiết khấu theo phần trăm hoặc tuyệt đối"
          persistent-hint
          prefix=""
          type="text"
          label="Chiết khấu"
          suffix="%"
          rules="max_value:100"
        />
      </v-flex>
      <v-flex xs12 sm6 class="pr-sm-2">
        <v-number-field-with-validation
          :loading="loading"
          :value="realPrice"
          name="real_price"
          type="text"
          label="Giá trị đơn hàng"
          readonly
          suffix="₫"
          required
        />
      </v-flex>
      <v-flex xs12 sm6 class="pl-sm-2">
        <v-number-field-with-validation
          v-model="item.price_per_mms"
          :loading="loading"
          name="price_per_mms"
          type="text"
          label="Đơn giá tin nhắn MMS theo đơn hàng"
          suffix="₫"
        />
      </v-flex>

      <v-flex xs12 sm6 class="pr-sm-2">
        <custom-date-picker
          v-model="item.date"
          :loading="loading"
          name="date"
          type="text"
          label="Ngày nạp đơn"
          required
          rules="required"
        />
      </v-flex>

      <v-flex xs12 sm6 class="pl-sm-2">
        <v-number-field-with-validation
          v-model="item.duration"
          :loading="loading"
          name="duration"
          label="Thời hạn sử dụng (Số ngày)"
          required
          suffix="ngày"
          rules="required"
        />
      </v-flex>

      <v-flex xs12 class="mt-4">
        <file-upload
          v-model="item.documents"
          :maximum="5"
          height="18vh"
          label="Tài liệu đính kèm"
          name="documents"
          multiple
          return-object
        ></file-upload>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.desc"
          :loading="loading"
          :counter="500"
          name="desc"
          label="Mô tả"
          rows="3"
          rules="max:500"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import CustomDatePicker from "@/components/common/CustomDatePicker.vue";
import FileUpload from "@/components/common/FileUpload/index.vue";
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import VTextAreaWithValidation from "@/components/common/VTextAreaWithValidation.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
// @ts-ignore
import moment from 'moment/src/moment';
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import { ROLE_IS_ADMIN } from "@/constants/role";
import { MIN_DECIMAL } from "@/constants/format";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { SettingUserPriceInterface } from "~/interface/data/banner";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import { TransactionRechargeMMSDailyDetail } from "~/interface/data/expense";
import GlobalDataInterface from "~/interface/data/global";
import { UserInterface } from "~/interface/data/user";
import { RepositoryInterface } from "~/interface/plugin/repository";

const DEFAULT_ITEM = {
  trans_id: "",
  code: "",
  date: "",
  price: null,
  price_per_mms: null,
  bonus: 0,
  bonus_percent: 0,
  duration: null,
  documents: null,
  desc: ""
};

interface ComponentData extends GlobalDataInterface {
  USER_RECEIVER_EXPORT: Array<string>;
  DOCUMENT: Array<string>;
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  reportTitle: string;
  authIsAdmin: boolean;
  realPrice: number;
  item: TransactionRechargeMMSDailyDetail;
  agency: UserInterface;
  $agencyWalletTransactionRepository: RepositoryInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethods {
  show(item: SettingUserPriceInterface): void;
  remove(userId: string): void;
  hidden(): void;
  exportFile(): void;
  export(): void;
  exportEmail(): void;
}

const EWalletFormRecharge = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "EWalletFormRecharge",
  components: {
    FileUpload,
    VTextAreaWithValidation,
    CustomDatePicker,
    VNumberFieldWithValidation,
    AgencyAdvertiserSelect,
    FormDialog,
    VTextFieldWithValidation
  },
  data() {
    return {
      title: "",
      agency: {},
      timeout: null,
      loading: false,
      isEdit: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    authIsAdmin() {
      return this.$authHasRole(ROLE_IS_ADMIN);
    },
    realPrice() {
      return this.item.price - this.item.bonus;
    }
  },
  watch: {
    "item.bonus": {
      handler(val) {
        if (this.item.price && !isNaN(val)) {
          this.$set(
            this.item,
            "bonus_percent",
            this.$filters.percent(val / this.item.price)
          );
        }
      }
    },
    "item.bonus_percent": {
      handler(val, oldVal) {
        const newDiscount = Math.round((this.item.price * val) / 100);

        const diff = Math.abs(this.item.bonus - newDiscount) / this.item.price;
        if (!isNaN(diff) && diff >= MIN_DECIMAL / 100) {
          this.$set(this.item, "bonus", newDiscount);
        }
      }
    },
    "item.price": {
      handler(val, oldVal) {
        if (this.item.bonus_percent) {
          const bonus = Math.round((val * this.item.bonus_percent) / 100);
          this.item.bonus = bonus;
        }
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(agency = null, item = null) {
      clearTimeout(this.timeout);
      this.agency = cloneDeep(agency);

      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        this.item.documents = JSON.parse(item.documents);
        this.title = "Cập nhật đơn hàng nạp tiền";
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
        this.title = "Tạo mới đơn hàng nạp tiền";
        this.$set(this.item, "date", moment().format("YYYY/MM/DD"));
      }

      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      this.agency = {};
      this.loading = false;
      this.isEdit = false;
      this.item = cloneDeep(DEFAULT_ITEM);
      clearTimeout(this.timeout);
    },
    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },
    async addItem() {
      this.loading = true;
      try {
        const res = await this.$agencyWalletTransactionRepository.create({
          ...this.item,
          real_price: this.realPrice,
          user_id: this.agency.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success", res.data);
          this.$toast.global.add_success("đơn hàng nạp tiền");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
      this.loading = false;
    },
    async editItem() {
      this.loading = true;

      try {
        const res = await this.$agencyWalletTransactionRepository.update({
          ...this.item,
          real_price: this.realPrice,
          user_id: this.agency.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success", res.data);
          this.$toast.global.edit_success("đơn hàng nạp tiền");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
      this.loading = false;
    }
  }
});

export default EWalletFormRecharge;
export type EWalletFormRechargeRef = InstanceType<typeof EWalletFormRecharge>;
</script>
