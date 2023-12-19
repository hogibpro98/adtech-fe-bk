<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    tabindex="-1"
    no-click-animation
    persistent
    content-class="flex xs12 md9 lg7 xl5"
    v-on="$listeners"
  >
    <v-card min-height="450">
      <validation-observer ref="form" v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(uploadToServer)">
          <v-card-title class="justify-content-center">
            <span class="headline px-3 pt-3 font-weight-medium">{{
              title
            }}</span>
          </v-card-title>
          <v-card-text>
            <v-container class="px-2">
              <v-row no-gutters>
                <v-col v-if="isAdjust" cols="12" class="px-2">
                  <v-alert dense type="info">
                    Vui lòng nhập thông tin hóa đơn mới để điều chỉnh cho hóa
                    đơn {{ item.name }}.<br />
                    Hóa đơn bị điều chỉnh sẽ được hủy và hóa đơn mới được xuất
                    ra.
                  </v-alert>
                </v-col>
                <v-col cols="6" class="px-2">
                  <api-select-service
                    v-model="item.name_service"
                    required
                    :loading="loading"
                    name="service"
                    label="Tên dịch vụ"
                    rules="required"
                    :return-object="false"
                    :readonly="isShowOnly"
                    :disabled="isDisabled"
                    @select-item="setBccsId"
                  />
                </v-col>
                <v-col cols="6" class="px-2">
                  <user-select
                    v-model="item.user"
                    :loading="loading"
                    name="user_id"
                    label="Tên đối tác"
                    item-value="id"
                    item-text="username"
                    required
                    rules="required"
                    :readonly="isShowOnly"
                    :type="ROLE_AGENCY"
                    :disabled="isDisabled"
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
                    :readonly="isShowOnly"
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
                    :readonly="isShowOnly"
                  >
                  </v-text-field-with-validation>
                </v-col>
                <v-col cols="6" class="px-2">
                  <v-text-field-with-validation
                    v-model="item.MST"
                    :loading="loading"
                    name="MST"
                    type="text"
                    label="Mã số thuế"
                    required
                    rules="required|max:100"
                    :readonly="isShowOnly"
                    counter="100"
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
                    :readonly="isShowOnly"
                  >
                  </v-text-field-with-validation>
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
                    :disabled="isShowOnly"
                  ></email-combobox>
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
                    :readonly="isShowOnly"
                  />
                </v-col>
                <v-col cols="12" class="px-2">
                  <v-text-field-with-validation
                    v-model="item.bccs_id"
                    :loading="loading"
                    name="bccs_id"
                    type="text"
                    label="Mã mặt hàng trên BCCS"
                    required
                    rules="required|max:255"
                    :readonly="isShowOnly"
                    counter="255"
                  />
                </v-col>
                <v-col cols="6" class="px-2">
                  <v-select-with-validation
                    v-model="item.revenue_object_type"
                    :loading="loading"
                    :items="[
                      { value: 1, text: 'Lên doanh thu đại lý' },
                      {
                        value: 2,
                        text: 'Lên doanh thu nhân viên; CTV/Điểm bán'
                      }
                    ]"
                    name="revenue_object_type"
                    label="Loại đối tượng lên doanh thu"
                    required
                    rules="required"
                    :readonly="isShowOnly"
                    :disabled="isDisabled"
                  />
                </v-col>
                <v-col cols="6" class="px-2">
                  <v-text-field-with-validation
                    v-model="item.revenue_object"
                    :loading="loading"
                    name="revenue_object"
                    type="text"
                    label="Đối tượng lên doanh thu"
                    :hint="
                      item.revenue_object_type !== null &&
                      item.revenue_object_type === 1
                        ? 'Cần nhập shopCode của đại lý trên BCCS'
                        : ''
                    "
                    persistent-hint
                    required
                    rules="required"
                    :readonly="isShowOnly"
                  />
                </v-col>
                <v-col cols="12" class="px-2">
                  <v-select-with-validation
                    v-model="item.pay_method"
                    :loading="loading"
                    :items="PAYMENT_METHOD"
                    name="pay_method"
                    label="Phương thức thanh toán"
                    :clearable="!isShowOnly"
                    :readonly="isShowOnly"
                    :disabled="isDisabled"
                  />
                </v-col>
                <v-col cols="6" class="px-2">
                  <v-number-field-with-validation
                    v-model="item.amount"
                    :loading="loading"
                    name="amount"
                    type="text"
                    label="Số tiền"
                    suffix="₫"
                    required
                    :readonly="isShowOnly"
                    :disabled="isDisabled"
                  />
                </v-col>
                <v-col cols="6" class="px-2">
                  <v-number-field-with-validation
                    v-model="item.discount"
                    :loading="loading"
                    name="discount"
                    type="text"
                    label="Số tiền chiết khấu"
                    suffix="₫"
                    :readonly="isShowOnly"
                    :disabled="isDisabled"
                  />
                </v-col>
                <v-col cols="6" class="px-2">
                  <file-upload
                    v-if="!isAccountant"
                    v-model="item.invoice_file"
                    :accept="DOCUMENT"
                    label="File hóa đơn"
                    name="invoice_file"
                    height="150px"
                    :disabled="isShowOnly"
                  ></file-upload>
                </v-col>
                <v-col cols="6" class="px-2">
                  <file-upload
                    v-if="!isAccountant"
                    v-model="item.authorization_file"
                    :accept="DOCUMENT"
                    label="File ủy nhiệm chi"
                    name="authorization_file"
                    height="150px"
                    :disabled="isShowOnly"
                  ></file-upload>
                </v-col>
                <v-col cols="12" class="px-2">
                  <v-text-area-with-validation
                    v-model="item.description"
                    :loading="loading"
                    name="description"
                    label="Mô tả"
                    rows="3"
                    counter="500"
                    rules="max:500"
                    :readonly="isShowOnly"
                  />
                </v-col>
                <v-col v-if="isShowOnly" cols="6" class="px-2 py-3">
                  <v-text-field-with-validation
                    v-model="item.created_at"
                    :loading="loading"
                    name="created_at"
                    type="text"
                    label="Thời gian tạo"
                    :readonly="isShowOnly"
                  />
                </v-col>
                <v-col v-if="isShowOnly" cols="6" class="px-2 py-3">
                  <v-text-field-with-validation
                    v-model="item.updated_at"
                    :loading="loading"
                    name="updated_at"
                    type="text"
                    label="Thời gian cập nhật lần cuối"
                    :readonly="isShowOnly"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-layout v-if="!isShowOnly && !isAdjust" justify-end class="pa-6">
            <v-btn
              v-if="!isAccountant"
              :loading="loading"
              color="primary darken-1"
              class="mr-0"
              text
              type="submit"
              @click.native="saveDraft"
            >
              Lưu nháp
            </v-btn>
            <v-layout justify-end>
              <v-btn color="grey" text @click.native="showing = false"
                >Hủy
              </v-btn>
              <v-btn
                :loading="loading"
                color="primary darken-1"
                class="mr-0"
                text
                type="submit"
                @click.native="exportInvoice"
              >
                Xuất hóa đơn
              </v-btn>
            </v-layout>
          </v-layout>
          <v-layout v-else-if="isAdjust" justify-end class="pa-6">
            <v-btn color="grey" text @click.native="showing = false"
              >Hủy
            </v-btn>
            <v-btn
              :loading="loading"
              color="primary darken-1"
              class="mr-0"
              text
              type="submit"
              @click.native="uploadMode = 'adjust'"
            >
              Điều chỉnh hóa đơn
            </v-btn>
          </v-layout>
          <v-layout
            v-else
            justify-center
            class="mt-2 sticky bottom--1 z-10 background px-8 py-2 border-top"
          >
            <v-btn color="grey" text @click.native="showing = false"
              >Đóng
            </v-btn>
          </v-layout>
        </form>
      </validation-observer>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import moment from 'moment/src/moment';
import cloneDeep from "lodash/cloneDeep";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogInterface } from "~/interface/components/dialog";
import { RepositoryInterface } from "~/interface/plugin/repository";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import { UserInterface } from "~/interface/data/user";
import { responseErrorToString } from "~/util/array";
import UserSelect from "~/components/select/UserSelect.vue";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { PAYMENT_METHOD } from "~/constants/dataSelect";
import { DOCUMENT } from "~/constants/fileType";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import FileUpload from "~/components/common/FileUpload/index.vue";
import CustomDatePicker from "~/components/common/CustomDatePicker.vue";
import TimeRangeInput from "~/components/common/TimeRangeInput.vue";
import { ROLE_ACCOUNTANT, ROLE_AGENCY } from "~/constants/role";
import ApiSelectService from "~/components/common/ApiServiceSelect.vue";
import EmailCombobox from "~/components/select/EmailCombobox.vue";

interface ComponentData {
  $refs: {
    form: FormDialogInterface;
  };
  showing: boolean;
  loading: boolean;
  isShowOnly: boolean;
  isAdd: boolean;
  isEdit: boolean;
  timeout: number;
  item: any;
  user: UserInterface;
  $invoiceRepository: RepositoryInterface;
  isDisabled: boolean;
  isAccountant: boolean;
}

interface ComponentMethods {
  show(item: any): void;

  addItem(): void;

  editItem(): void;

  resetData(): void;

  doDraft(): void;

  doExport(): void;
}

const DEFAULT_ITEM = {
  user: null,
  user_id: null,
  name: "",
  MST: "",
  bccs_id: "",
  amount: null,
  company_name: "",
  customer_name: "",
  date: null,
  discount: null,
  invoice_file: null,
  name_service: null,
  pay_method: null,
  phone_number: "",
  revenue_object: "",
  revenue_object_type: 1,
  status: "",
  email: []
};

const InvoiceDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "InvoiceDialog",
  components: {
    EmailCombobox,
    ApiSelectService,
    TimeRangeInput,
    CustomDatePicker,
    FileUpload,
    VTextAreaWithValidation,
    VTextFieldWithValidation,
    VSelectWithValidation,
    UserSelect,
    BusinessActivitySelect,
    AgencyAdvertiserSelect,
    VNumberFieldWithValidation
  },
  data() {
    return {
      showing: false,
      loading: false,
      timeout: null,
      isAdd: false,
      isEdit: false,
      isShowOnly: false,
      isAdjust: false,
      item: cloneDeep(DEFAULT_ITEM),
      PAYMENT_METHOD,
      draft: false,
      uploadMode: "",
      DOCUMENT,
      ROLE_AGENCY,
      name_service: null
    };
  },
  computed: {
    title() {
      if (this.isAdd) return "Thêm hóa đơn mới";
      if (this.isEdit) return "Chỉnh sửa hóa đơn";
      if (this.isShowOnly) return "Xem chi tiết hóa đơn";
      if (this.isAdjust) return "Nhập thông tin hóa đơn điều chỉnh";
      return "";
    },
    user() {
      return this.item.user;
    },
    isAccountant() {
      return this.$authHasRole(ROLE_ACCOUNTANT);
    },
    isDisabled() {
      return this.isAccountant || this.isShowOnly;
    }
  },
  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  created() {
    console.log("auth", this.$authHasRole(ROLE_ACCOUNTANT));
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    handleSelectUser(val) {
      if (val && val.id) {
        this.item.company_name = val.full_name || "";
        if (val.user_info?.representative) {
          this.item.customer_name = val.user_info?.representative;
        }
        if (val.user_info?.tax_no) {
          this.item.MST = val.user_info?.tax_no;
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
    setBccsId(val) {
      if (val) {
        this.item.bccs_id = val.bccs_id;
      }
    },
    async uploadToServer() {
      if (this.uploadMode === "draft") {
        this.doDraft();
      } else if (this.uploadMode === "export") {
        this.doExport();
      } else if (this.uploadMode === "adjust") {
        this.doAdjust();
      }
    },
    async show(item = null, mode = "add") {
      if (item === null) {
        this.isAdd = true;
        this.item = cloneDeep(DEFAULT_ITEM);
        this.$set(this.item, "date", moment().format("YYYY/MM/DD"));
      } else {
        this.item = cloneDeep(item);
        if (mode === "show") {
          this.isShowOnly = true;
        } else if (mode === "edit") {
          this.isEdit = true;
        } else if (mode === "adjust") {
          this.isAdjust = true;
        }
      }
      this.showing = true;
      await this.$nextTick();
      await this.$nextTick();
      if (item !== null) {
        this.item.company_name = item.company_name;
        this.item.customer_name = item.customer_name;
        this.item.MST = item.MST;
        this.item.address = item.address;
        this.item.phone_number = item.phone_number;
        this.item.email = item.email;
      }
    },

    async doAdjust() {
      this.loading = true;
      try {
        const res = await this.$invoiceRepository.update({
          ...this.item,
          status: "adjusted",
          user_id: this.item.user?.id,
          username: this.item.user?.username
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.success("Điều chỉnh hóa đơn thành công");
        } else {
          this.showing = false;
          // this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
          this.$emit("action-success");
        } else {
          this.showing = false;
          this.$emit("action-success");
          // this.$toast.global.action_fail();
        }
      }
    },

    async doDraft() {
      this.loading = true;
      try {
        // const res = { code: CODE_SUCCESS };
        let res = {};
        if (this.item.id) {
          res = await this.$invoiceRepository.update({
            ...this.item,
            status: "draft",
            username: this.item.user?.username,
            user_id: this.item.user?.id
          });
        } else {
          res = await this.$invoiceRepository.create({
            ...this.item,
            status: "draft",
            username: this.item.user?.username,
            user_id: this.item.user?.id
          });
        }
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.success("Lưu nháp hóa đơn thành công");
        } else {
          this.showing = false;
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        console.log(e);
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.showing = false;
          // this.$toast.global.action_fail();
        }
      }
    },

    async doExport() {
      this.loading = true;
      try {
        // const res = { code: CODE_SUCCESS };
        let res = {};
        if (this.item.id) {
          res = await this.$invoiceRepository.update({
            ...this.item,
            user_id: this.item.user?.id,
            username: this.item.user?.username,
            status: "exported"
          });
        } else {
          res = await this.$invoiceRepository.create({
            ...this.item,
            user_id: this.item.user?.id,
            username: this.item.user?.username,
            status: "exported"
          });
        }
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.success("Xuất hóa đơn thành công");
        } else {
          this.showing = false;
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        this.$emit("action-success");
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.showing = false;
          // this.$toast.global.action_fail();
        }
      }
    },

    async saveDraft() {
      this.uploadMode = "draft";
      await this.$nextTick();
    },

    async exportInvoice() {
      this.uploadMode = "export";
      await this.$nextTick();
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.item = cloneDeep(DEFAULT_ITEM);
        this.isAdd = false;
        this.isEdit = false;
        this.isShowOnly = false;
        this.isAdjust = false;
        this.$refs.form.reset();
      }, 300);
    }
  }
});

export default InvoiceDialog;
export type InvoiceDialoggRef = InstanceType<typeof InvoiceDialog>;
</script>
