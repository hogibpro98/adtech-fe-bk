<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    content-class="flex xs12 md8 lg6 xl4"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-menu
          v-model="fromDateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template #activator="{ on }">
            <v-text-field
              v-model="fromDateDisp"
              label="Ngày"
              prepend-icon="mdi-calendar"
              :disabled="isEdit"
              :value="fromDateDisp"
              required
              v-on="on"
            >
              <template #label>
                {{ $attrs.label || label }} <span class="red--text"> (*) </span>
              </template>
            </v-text-field>
          </template>
          <v-date-picker
            v-model="defaultItem.full_date"
            :disabled="isEdit"
            locale="vi"
            color="primary"
            no-title
            required
            :max="currentDate"
            @input="fromDateMenu = false"
          ></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.agency_name"
          label="Agency"
          name="agency_name"
          required
          rules="required"
          counter="191"
          maxlength="191"
        >
        </v-text-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.brandname"
          label="Brandname"
          name="brandname"
          required
          rules="required"
          counter="191"
          maxlength="191"
        >
        </v-text-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.ads_type"
          label="Kiểu truyền thông"
          name="ads_type"
          :disabled="isEdit"
          required
          rules="required"
          counter="30"
          maxlength="30"
        >
        </v-text-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.message_type"
          label="Loại tin"
          name="message_type"
          required
          rules="required"
          counter="30"
          maxlength="30"
        >
        </v-text-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.cat_id"
          label="Lĩnh vực hoạt động"
          name="cat_id"
          required
          rules="required"
          counter="191"
          maxlength="191"
        >
        </v-text-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="defaultItem.manager"
          label="Đơn vị quản lý"
          name="manager"
          required
          rules="required"
          counter="191"
          maxlength="191"
        >
        </v-text-field-with-validation>
      </v-flex>
      <v-flex v-if="checkAdsType == `REDIRECT`" xs12 class="form-group">
        <v-number-field-with-validation
          v-model="defaultItem.click"
          :loading="loading"
          required
          :decimal="false"
          name="click"
          label="Số click"
          rules="required|min_value:0|max:14"
          @input="calculateTotalMoney"
        />
      </v-flex>
      <v-flex v-if="checkAdsType == `REDIRECT`" xs12 class="form-group">
        <v-number-field-with-validation
          v-model="defaultItem.view"
          :loading="loading"
          required
          :decimal="false"
          name="view"
          label="Số view"
          rules="required|min_value:0|max:14"
          @input="calculateTotalMoney"
        />
      </v-flex>
      <v-flex v-if="checkAdsType == `MMS`" xs12 class="form-group">
        <v-number-field-with-validation
          v-model="defaultItem.num_message_success"
          :loading="loading"
          required
          :decimal="false"
          name="num_message_success"
          label="Số MT"
          rules="required|min_value:0|max:14"
          @input="calculateTotalMoney"
        />
      </v-flex>
      <v-flex v-if="checkAdsType == `REDIRECT`" xs12 class="form-group">
        <v-number-field-with-validation
          v-model="defaultItem.price_click"
          :loading="loading"
          required
          :decimal="false"
          name="price_click"
          label="Đơn giá click"
          rules="required|min_value:0|max:14"
          @input="calculateTotalMoney"
        />
      </v-flex>
      <v-flex v-if="checkAdsType == `REDIRECT`" xs12 class="form-group">
        <v-number-field-with-validation
          v-model="defaultItem.price_view"
          :loading="loading"
          required
          :decimal="false"
          name="price_view"
          label="Đơn giá view"
          rules="required|min_value:0|max:14"
          @input="calculateTotalMoney"
        />
      </v-flex>
      <v-flex v-if="checkAdsType == `MMS`" xs12 class="form-group">
        <v-number-field-with-validation
          v-model="defaultItem.price_num_message_success"
          :loading="loading"
          required
          :decimal="false"
          name="price_num_message_success"
          label="Đơn giá MT"
          rules="required|min_value:0|max:14"
          @input="calculateTotalMoney"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="defaultItem.total_money"
          :loading="loading"
          required
          :decimal="false"
          name="total_money"
          label="Doanh thu"
          rules="required|min_value:0|max:14"
          disabled
        />
      </v-flex>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { cloneDeep } from "lodash";
import FormDialog from "~/components/common/FormDialog.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import zipFiles from "~/mixins/zipFiles";
import CustomDatePicker from "~/components/common/CustomDatePicker.vue";

interface ComponentData {
  loading: boolean;
  labelButtonConfirm: string;
  isEdit: boolean;
  defaultItem: {
    name: string;
    code: string;
  };
  isDisabled: boolean;
}

interface ComponentMethods {
  onSubmit(): void;

  editItem(): void;

  addItem(): void;

  show(): void;

  hide(): void;
}

interface ComponentComputed {
  title: string;
  labelButtonConfirm: string;
}

interface ComponentProps {}

const DEFAULT_ITEM = {
  id: null,
  full_date: null,
  agency_name: null,
  brandname: null,
  message_type: null,
  ads_type: null,
  cat_id: null,
  manager: null,
  click: 0,
  view: 0,
  num_message_success: 0,
  price_click: 0,
  price_view: 0,
  price_num_message_success: 0,
  total_money: 0
};

const ManualSummaryDayDialog = Vue.extend<
  ComponentData,
  ComponentMethods,
  ComponentComputed,
  ComponentProps
>({
  name: "ManualSummaryDayDialog",
  components: {
    CustomDatePicker,
    VNumberFieldWithValidation,
    FormDialog,
    VTextFieldWithValidation
  },

  props: {
    label: {
      type: String,
      default: "Ngày"
    }
  },
  data() {
    return {
      loading: false,
      isEdit: false,
      defaultItem: cloneDeep(DEFAULT_ITEM),
      isDisabled: false,
      fromDateMenu: false,
      fromDateVal: null,
      currentDate: new Date().toISOString().substr(0, 10),
      adsDatas: {
        opt: {
          ads_type: ["MMS", "SMS"],
          messageType: ["QC", "SCKH"]
        },
        redirect: {
          ads_type: ["REDIRECT"],
          messageType: ["STICKEY", "POPUP", "BANNER"]
        }
      }
    };
  },
  computed: {
    title() {
      if (this.isEdit) {
        return "Cập nhật báo cáo doanh thu agency theo ngày";
      } else {
        return "Thêm mới báo cáo doanh thu agency theo ngày";
      }
    },
    labelButtonConfirm() {
      if (this.isEdit) {
        return "Cập nhật";
      } else {
        return "Xác nhận";
      }
    },
    fromDateDisp() {
      return this.formatDate(this.defaultItem.full_date);
    },
    checkAdsType() {
      if (this.adsDatas.opt.ads_type.includes(this.defaultItem.ads_type)) {
        return "MMS";
      }
      if (this.adsDatas.redirect.ads_type.includes(this.defaultItem.ads_type)) {
        return "REDIRECT";
      }
    }
  },
  methods: {
    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },
    async editItem() {
      this.loading = true;
      try {
        const result = await this.$axios.$post(
          "manual-summary-day/update",
          this.defaultItem
        );
        if (result.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success(
            "sửa báo cáo doanh thu agency theo ngày"
          );
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      } finally {
        this.loading = false;
      }
    },
    async addItem() {
      this.loading = true;
      try {
        const result = await this.$axios.$post(
          "manual-summary-day/store",
          this.defaultItem
        );
        console.log(result);
        if (result.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success(
            "thêm báo cáo doanh thu agency theo ngày"
          );
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        console.log(e.response);
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      } finally {
        this.loading = false;
      }
    },
    hide() {
      this.$refs.refFormDialog.hidden();
    },
    show(item = null) {
      if (item) {
        this.isEdit = true;
        this.isDisabled = true;
        this.defaultItem = cloneDeep(item);
      } else {
        this.isDisabled = false;
        this.isEdit = false;
        this.defaultItem = cloneDeep(DEFAULT_ITEM);
      }
      this.$refs.refFormDialog.show();
    },
    formatDate(date) {
      const formattedDate = new Date(date);
      const day = formattedDate
        .getDate()
        .toString()
        .padStart(2, "0");
      const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = formattedDate.getFullYear();
      return `${day}/${month}/${year}`;
    },
    calculateTotalMoney() {
      if (this.checkAdsType == "MMS") {
        this.defaultItem.total_money =
          this.defaultItem.price_num_message_success *
          this.defaultItem.num_message_success;
      }
      if (this.checkAdsType == "REDIRECT") {
        this.defaultItem.total_money =
          this.defaultItem.price_view * this.defaultItem.view +
          this.defaultItem.price_click * this.defaultItem.click;
      }
    }
  }
});

export default ManualSummaryDayDialog;
</script>

<style scoped></style>
