<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    width="unset"
    content-class="flex xs12 sm8 md6 xl4"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline"
          >{{ isEdit ? "Cập nhật" : "Thêm" }} advertiser</span
        >
      </v-card-title>
      <v-card-text>
        <validation-observer ref="form" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <v-layout flex wrap>
              <v-flex xs12>
                <agency-advertiser-select
                  v-model="item.agency"
                  :query-params="queryParams"
                  :disabled="!$authHasRole('admin')"
                  label="Tài khoản thuộc agency"
                  name="agency_id"
                  rules="required"
                  required
                >
                </agency-advertiser-select>
              </v-flex>
              <v-flex xs12 md6 class="pr-md-2">
                <v-text-field-with-validation
                  v-model="item.username"
                  :loading="loading"
                  :disabled="isEdit"
                  name="username"
                  type="text"
                  label="Tên tài khoản"
                  required
                  rules="required|min:4|max:128|isUsername"
                />
              </v-flex>
              <v-flex xs12 md6 class="pl-md-2">
                <v-text-field-with-validation
                  v-model="item.full_name"
                  :loading="loading"
                  name="full_name"
                  type="text"
                  label="Tên doanh nghiệp"
                  required
                  rules="required|max:255"
                />
              </v-flex>
              <v-flex xs12 md6 class="pr-md-2">
                <v-text-field-with-validation
                  v-model="item.email"
                  :loading="loading"
                  :disabled="isEdit"
                  name="email"
                  type="text"
                  label="Email"
                  required
                  rules="required|email|max:255"
                />
              </v-flex>
              <v-flex xs12 md6 class="pl-md-2">
                <v-text-field-with-validation
                  v-model="item.representative"
                  :loading="loading"
                  name="representative"
                  type="text"
                  label="Người đại diện"
                  rules="max:100"
                />
              </v-flex>
              <v-flex xs12 md6 class="pr-md-2">
                <v-text-field-with-validation
                  v-model="item.tax_no"
                  :loading="loading"
                  name="tax_no"
                  type="text"
                  label="Mã số thuế"
                  rules="max:100|numeric"
                />
              </v-flex>
              <v-flex xs12 md6 class="pl-md-2">
                <v-text-field-with-validation
                  v-model="item.phone_number"
                  :loading="loading"
                  name="phone_number"
                  type="text"
                  label="Số điện thoại"
                  rules="max:15|numeric"
                />
              </v-flex>
              <v-flex xs12>
                <v-text-area-with-validation
                  v-model="item.address"
                  :loading="loading"
                  :counter="500"
                  name="address"
                  label="Địa chỉ"
                  rows="3"
                  rules="max:500"
                />
              </v-flex>

              <v-flex xs12>
                <service-checkbox
                  v-model="item.services"
                  name="services"
                  required
                  rules="required"
                  has-plan
                />
              </v-flex>

              <v-flex xs12 class="py-2">
                <file-upload
                  v-model="item.documents"
                  :accept="acceptFileTypes"
                  maximum="5"
                  label="Tài liệu đính kèm"
                  class="registration-upload"
                  name="documents"
                  height="150px"
                  multiple
                  return-object
                ></file-upload>
              </v-flex>
            </v-layout>
            <v-layout justify-end>
              <v-btn color="grey" text @click.native="showing = false"
                >Hủy</v-btn
              >
              <v-btn
                :loading="loading"
                color="primary darken-1"
                class="mr-0"
                text
                type="submit"
              >
                {{ isEdit ? "Cập nhật" : "Thêm" }}
              </v-btn>
            </v-layout>
          </form>
        </validation-observer>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { cloneDeep, pick } from "lodash";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { ROLE_AGENCY } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422, USER_STATUS } from "~/constants/code";
import FileUpload from "~/components/common/FileUpload/index.vue";
import { DOCUMENT } from "~/constants/fileType";
import { ApiActionInterface } from "~/interface/plugin/repository";
import { FormDialogInterface } from "~/interface/components/dialog";
import ServiceCheckbox from "~/components/common/ServiceCheckbox.vue";

const DEFAULT_ITEM = {
  username: "",
  full_name: "",
  email: "",
  tax_no: "",
  phone_number: "",
  password: "",
  address: "",
  representative: "",
  documents: null,
  agency: null,
  services: []
};

interface ItemInterface {
  agency: object;
  username: string;
  full_name: string;
  email: string;
  tax_no: string;
  phone_number: string;
  password: string;
  address: string;
  representative: string;
  documents: Array<string>;
}

interface ComponentData {
  $apiAction: ApiActionInterface;
  $refs: {
    form: FormDialogInterface;
  };
  showing: boolean;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  queryParams: {
    type: string;
  };
  item: ItemInterface;
  user_status: object;
  acceptFileTypes: Array<string>;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  resetData(): void;
  deleteItem(): void;
}

const AdvertiserDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "AdvertiserDialog",
  components: {
    ServiceCheckbox,
    AgencyAdvertiserSelect,
    FileUpload,
    VTextAreaWithValidation,
    VTextFieldWithValidation
  },
  data() {
    return {
      showing: false,
      isEdit: false,
      timeout: null,
      loading: false,
      queryParams: {
        type: ROLE_AGENCY
      },
      item: cloneDeep(DEFAULT_ITEM),
      user_status: USER_STATUS,
      acceptFileTypes: DOCUMENT
    };
  },
  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    async show(item = null, agency = undefined) {
      if (item) {
        this.isEdit = true;
        const newItem = pick(item, [
          "id",
          "username",
          "full_name",
          "email",
          "password",
          "phone_number",
          "user_info",
          "status",
          "services"
        ]);
        const userInfo = newItem.user_info
          ? {
              ...newItem.user_info,
              documents: newItem.user_info.documents
                ? JSON.parse(newItem.user_info.documents)
                : null
            }
          : {};
        await this.$nextTick();
        this.item = {
          ...userInfo,
          ...newItem,
          agency
        };
      }
      if (this.$authHasRole(ROLE_AGENCY)) {
        this.item.agency = this.$auth.user;
      }
      this.showing = true;
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
        const res = await this.$apiAction.storeAdvertiser({
          ...this.item,
          agency_id: this.item.agency?.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("create-success");
          this.$toast.global.add_success("người dùng");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    },

    async editItem() {
      this.loading = true;
      try {
        const res = await this.$apiAction.updateAdvertiser({
          ...this.item,
          agency_id: this.item.agency?.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("update-success");
          this.$toast.global.edit_success("người dùng");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        }
      }
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
        this.$refs.form.reset();
      }, 300);
    }
  }
});

export default AdvertiserDialog;
export type AdvertiserDialogRef = InstanceType<typeof AdvertiserDialog>;
</script>
<style lang="scss">
.registration-upload {
  .v-transmit__upload-area {
    min-height: unset;
    height: 144px;
  }
}
</style>
