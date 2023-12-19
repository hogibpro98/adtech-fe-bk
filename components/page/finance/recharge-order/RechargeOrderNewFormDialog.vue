<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 md7 xl5"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-col cols="12" class="px-2">
        <user-select
          v-model="item.user"
          :loading="loading"
          :disabled="isDisableUserSelect"
          name="user_id"
          label="Tên đối tác"
          item-value="id"
          item-text="username"
          required
          rules="required"
          type="agency"
          @select-item="handleSelectUser"
        />
      </v-col>
      <v-col cols="6" class="px-2">
        <v-text-field-with-validation
          v-model="item.company_name"
          :loading="loading"
          name="company_name"
          type="text"
          label="Tên công ty"
          required
          rules="required|max:255"
        >
        </v-text-field-with-validation>
      </v-col>
      <v-col cols="6" class="px-2">
        <v-text-field-with-validation
          v-model="item.customer_name"
          :loading="loading"
          name="customer_name"
          type="text"
          label="Tên khách hàng"
          required
          rules="required|max:255"
        >
        </v-text-field-with-validation>
      </v-col>
      <v-col cols="6" class="px-2">
        <v-text-field-with-validation
          v-model="item.tin"
          :loading="loading"
          name="tin"
          label="Mã số thuế"
          type="text"
          required
          maxlength="100"
          rules="required|max:100"
        >
        </v-text-field-with-validation>
      </v-col>
      <v-col cols="6" class="px-2">
        <v-text-field-with-validation
          v-model="item.phone_number"
          :loading="loading"
          name="phone_name"
          type="text"
          label="Số điện thoại"
          required
          rules="required|phone"
        >
        </v-text-field-with-validation>
      </v-col>

      <v-col cols="12" class="px-2 mt-3">
        <v-text-area-with-validation
          v-model="item.address"
          :loading="loading"
          :counter="500"
          name="address"
          label="Địa chỉ"
          rows="3"
          required
          rules="required|max:500"
        />
      </v-col>
      <v-col cols="12" class="px-2">
        <email-combobox
          v-model="item.email"
          :loading="loading"
          multiple
          name="email"
          label="Email"
          resource="/user/receiver-export"
          item-value="email"
          item-text="email"
          required
          rules="required"
        ></email-combobox>
      </v-col>
      <v-col cols="6" class="px-2">
        <v-select-with-validation
          v-model="item.payment_method"
          :loading="loading"
          :items="paymentMethods"
          name="pay_method"
          label="Phương thức thanh toán"
          :clearable="!isShowOnly"
        />
      </v-col>
      <v-col cols="6" class="px-2">
        <api-select-service
          v-model="item.service"
          :loading="loading"
          name="service"
          item-value="text"
          :return-object="false"
          label="Dịch vụ"
          required
          rules="required"
          :clearable="!isShowOnly"
          :query-params="serviceParams"
        />
      </v-col>
      <v-col cols="12" class="px-2">
        <v-checkbox
          v-model="item.export_invoice"
          name="export_invoice"
          label="Xuất hóa đơn"
          :true-value="1"
          :false-value="0"
          class="ma-0 pa-0 pt-2"
        >
        </v-checkbox>
      </v-col>
      <v-col cols="6" class="px-2">
        <v-number-field-with-validation
          v-model="item.amount"
          :loading="loading"
          name="amount"
          type="text"
          label="Số tiền tiêu dùng"
          suffix="₫"
          required
          rules="required|min_value:1000"
        />
      </v-col>
      <v-col col="6" class="px-2">
        <api-select-with-validation
          v-model="selectedProfile"
          resource="discount-profile"
          label="Chính sách chiết khấu"
          @select-item="handleSelectProfileDiscount"
        />
      </v-col>
      <v-col cols="6" class="px-2">
        <v-number-field-with-validation
          v-model="discountPercent"
          :loading="loading"
          name="discount_percent"
          type="text"
          decimal
          label="Chiết khấu"
          :disabled="hasSelectedProfile"
          suffix="%"
          required
          rules="max_value:100|required"
          :max-value="100"
        />
      </v-col>
      <v-col cols="6" class="px-2">
        <v-number-field-with-validation
          v-model="item.discount"
          :loading="loading"
          name="discount"
          type="text"
          label="Số tiền chiết khấu"
          :disabled="hasSelectedProfile"
          required
          rules="required"
          suffix="₫"
        />
      </v-col>
      <v-col cols="6" class="px-2">
        <v-number-field-with-validation
          v-model="amountWithoutVat"
          :loading="loading"
          name="amountWithoutVat"
          readonly
          type="text"
          required
          rules="required"
          label="Tiền hàng chưa VAT"
          suffix="₫"
        />
      </v-col>
      <v-col cols="6" class="px-2">
        <v-select-with-validation
          v-model="item.vat"
          :loading="loading"
          :items="vatTypes"
          name="vat"
          required
          label="Thuế suất"
          rules="required"
        />
      </v-col>
      <v-col cols="6" class="px-2">
        <v-number-field-with-validation
          v-model="amountVat"
          :loading="loading"
          name="amountVat"
          type="text"
          readonly
          required
          rules="required"
          label="VAT"
          suffix="₫"
        />
      </v-col>
      <v-col cols="6" class="px-2">
        <v-number-field-with-validation
          :value="realAmount"
          :loading="loading"
          name="realAmount"
          type="text"
          readonly
          required
          rules="required"
          label="Số tiền thực nạp"
          suffix="₫"
        />
      </v-col>
      <v-col cols="12" class="px-2">
        <file-upload
          v-model="item.documents"
          required
          :accept="DOCUMENT"
          label="Hồ sơ thanh toán"
          return-object
          name="documents"
          height="200px"
          rules="required"
          :maximum="50"
          :max-file-size="20"
        ></file-upload>
      </v-col>
      <v-col cols="12" class="px-2">
        <v-text-area-with-validation
          v-model="item.note"
          :loading="loading"
          name="reason"
          label="Ghi chú"
          rows="3"
          counter="500"
          rules="max:500"
        />
      </v-col>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import FormDialog, { FormDialogRef } from "~/components/common/FormDialog.vue";
import { DeviceInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import UserSelect from "~/components/select/UserSelect.vue";
import FileUpload from "~/components/common/FileUpload/index.vue";
import { PAYMENT_METHOD, VAT_TYPES } from "~/constants/dataSelect";
import { DOCUMENT } from "~/constants/fileType";
import EmailCombobox from "~/components/select/EmailCombobox.vue";
import { ROLE_AGENCY } from "~/constants/role";
import ServiceCheckbox from "~/components/common/ServiceCheckbox.vue";
import ApiSelectService from "~/components/common/ApiServiceSelect.vue";
import AutoCompleteWithValidation from "~/components/common/AutoCompleteWithValidation.vue";

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
  user: null,
  company_name: "",
  customer_name: "",
  tin: "",
  phone_number: "",
  address: "",
  payment_method: null,
  discount_profile: null,
  amount: 0,
  vat: null,
  discount: 0,
  documents: null,
  reason: "",
  note: "",
  export_invoice: 1
};

/**
 * @property {Object} $rechargeOrderRepository
 */

const RechargeOrderNewFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RechargeOrderNewFormDialog",
  components: {
    ApiSelectService,
    ServiceCheckbox,
    EmailCombobox,
    FileUpload,
    UserSelect,
    VSelectWithValidation,
    VTextAreaWithValidation,
    VNumberFieldWithValidation,
    AgencyAdvertiserSelect,
    FormDialog,
    VTextFieldWithValidation,
    ApiSelectWithValidation
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      discountPercent: null,
      selectedProfile: null,
      discountProfile: {
        discount_config: []
      },
      queryParams: {
        custom_user_id: null
      }
    };
  },
  computed: {
    hasSelectedProfile() {
      return !!this.selectedProfile;
    },
    serviceParams() {
      return {
        custom_user_id: this.item.user?.id
      };
    },
    isDisableUserSelect() {
      return this.isAgency || this.isEdit;
    },
    isAgency() {
      return this.$authHasRole(ROLE_AGENCY);
    },
    paymentMethods() {
      return PAYMENT_METHOD;
    },
    vatTypes() {
      return VAT_TYPES;
    },
    discountValue() {
      return this.item.discount;
    },
    realAmount() {
      return (this.item.amount || 0) - (this.item.discount || 0);
    },
    amountVat() {
      const vat = this.item.vat > 0 ? this.item.vat : 0;
      return Math.round((vat / (100 + vat)) * this.realAmount);
    },
    amountWithoutVat() {
      return this.realAmount - this.amountVat;
    },
    DOCUMENT() {
      return DOCUMENT;
    }
  },
  watch: {
    // realAmount(val) {
    //   if (this.item.amount && this.item.discount) {
    //     this.item.discount = ( this.item.amount * this.item.discountPercent ) / 100;
    //     // this.discountPercent = (this.item.discount / this.item.amount) * 100;
    //   } else {
    //     this.discountPercent = null;
    //   }
    // },
    "item.amount"(val) {
      if (this.discountProfile) {
        this.discountPercent = 0;
        for (let i = 0; i < this.discountProfile.discount_config.length; i++) {
          if (val >= this.discountProfile.discount_config[i].money) {
            this.discountPercent = this.discountProfile.discount_config[
              i
            ].discounted_rates;
          }
        }
      }
      if (val && this.discountPercent) {
        this.item.discount = Math.round((val * this.discountPercent) / 100);
      } else {
        this.item.discount = 0;
      }
    },
    "item.discount"(val) {
      if (this.item.amount && val) {
        this.discountPercent = (val / this.item.amount) * 100;
      } else {
        this.discountPercent = 0;
      }
    },
    discountPercent(val) {
      if (this.item.amount && val) {
        this.item.discount = (val * this.item.amount) / 100;
      } else {
        this.item.discount = 0;
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    handleSelectProfileDiscount(val) {
      this.discountProfile = cloneDeep(val);
      if (this.item.amount) {
        this.discountPercent = 0;
        for (let i = 0; i < val.discount_config.length; i++) {
          if (this.item.amount >= val.discount_config[i].money) {
            this.discountPercent = val.discount_config[i].discounted_rates;
          }
        }
      } else {
        this.discountPercent = 0;
      }
    },
    async show(item = null) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        await this.$nextTick();
        if (item.discount_profile) {
          this.selectedProfile = item.discount_profile;
        } else {
          this.selectedProfile = null;
        }
      } else {
        this.isEdit = false;
        if (this.isAgency) {
          DEFAULT_ITEM.user = {
            id: this.$auth.user.id,
            username: this.$auth.user.username,
            full_name: this.$auth.user.full_name,
            email: this.$auth.user.email,
            phone_number: this.$auth.user.phone_number
          };
          DEFAULT_ITEM.tin = this.$auth.user.info.tax_no;
          DEFAULT_ITEM.address = this.$auth.user.info.address;
          DEFAULT_ITEM.customer_name = this.$auth.user.info.representative;
        }
        this.item = cloneDeep(DEFAULT_ITEM);
        this.discountProfile = {
          discount_config: []
        };
        this.selectedProfile = null;
      }
      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} đơn hàng nạp tiền`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      this.selectedProfile = null;
      clearTimeout(this.timeout);
    },
    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },
    mapData() {
      const item = cloneDeep(this.item);
      item.user_id = item.user.id;
      if (this.selectedProfile) {
        item.discount_profile_id = this.selectedProfile.id;
      }
      return item;
    },
    handleSelectUser(val) {
      if (val && val.id && !this.isEdit) {
        this.item.company_name = val.full_name || "";
        this.queryParams.custom_user_id = val.id;
        if (val.user_info?.representative) {
          this.item.customer_name = val.user_info?.representative;
        }
        if (val.user_info?.tax_no) {
          this.item.tin = val.user_info?.tax_no;
        }
        if (val.user_info?.address) {
          this.item.address = val.user_info?.address;
        }
        this.item.phone_number = val.phone_number || "";
        if (val.email) {
          this.item.email = [val.email];
        }
      }
    },

    async addItem() {
      this.loading = true;
      try {
        const item = this.mapData();
        const res = await this.$axios.$post("/order/store", item);
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
    },
    async editItem() {
      this.loading = true;
      try {
        const item = this.mapData();
        const res = await this.$axios.$post("/order/update", item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("edit-success");
          this.$toast.global.edit_success("đơn hàng nạp tiền");
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

export default RechargeOrderNewFormDialog;
export type RechargeOrderNewFormDialogRef = InstanceType<
  typeof RechargeOrderNewFormDialog
>;
</script>
