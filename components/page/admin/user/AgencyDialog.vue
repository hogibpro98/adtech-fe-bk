<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    content-class="flex xs12 lg9"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline">{{ isEdit ? "Cập nhật" : "Thêm" }} agency</span>
      </v-card-title>
      <v-card-text>
        <validation-observer ref="form" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <v-layout flex wrap>
              <v-flex lg5>
                <v-flex xs12 class="px-2">
                  <v-text-field-with-validation
                    v-model="item.username"
                    :loading="loading"
                    :disabled="isEdit"
                    name="username"
                    type="text"
                    label="Tên tài khoản"
                    required
                    rules="required|min:4|isUsername|max:128"
                  />
                </v-flex>
                <v-flex xs12 class="px-2">
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
                <v-flex xs12 class="px-2">
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
                <v-flex xs12 class="px-2">
                  <v-text-field-with-validation
                    v-model="item.representative"
                    :loading="loading"
                    name="representative"
                    type="text"
                    label="Người đại diện"
                    required
                    rules="required|max:100"
                  />
                </v-flex>
                <v-flex xs12 class="px-2">
                  <v-text-field-with-validation
                    v-model="item.tax_no"
                    :loading="loading"
                    name="tax_no"
                    type="text"
                    label="Mã số thuế"
                    required
                    :rules="taxNumberRule"
                  />
                </v-flex>
                <v-flex xs12 class="px-2">
                  <v-text-field-with-validation
                    v-model="item.phone_number"
                    :loading="loading"
                    name="phone_number"
                    type="text"
                    label="Số điện thoại"
                    rules="max:15|numeric"
                  />
                </v-flex>
                <v-flex xs12 class="px-2">
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
              </v-flex>

              <v-flex lg7>
                <v-flex xs12 class="px-2 py-2">
                  <file-upload
                    v-model="item.cooperation_proposal_document"
                    :accept="acceptFileTypes"
                    label="Công văn đề xuất hợp tác"
                    class="registration-upload"
                    name="cooperation_proposal_document"
                    height="150px"
                    return-object
                  ></file-upload>
                </v-flex>
                <v-flex xs12 class="px-2 py-2">
                  <file-upload
                    v-model="item.business_registration_document"
                    :accept="acceptFileTypes"
                    label="Đăng ký kinh doanh"
                    class="registration-upload"
                    name="business_registration_document"
                    height="150px"
                    return-object
                  ></file-upload>
                </v-flex>
                <v-flex xs12 class="px-2 py-2">
                  <file-upload
                    v-model="item.capacity_statement_document"
                    :accept="acceptFileTypes"
                    label="Hồ sơ năng lực"
                    name="capacity_statement_document"
                    class="registration-upload"
                    height="150px"
                    return-object
                  ></file-upload>
                </v-flex>
              </v-flex>
            </v-layout>
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
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422, USER_STATUS } from "~/constants/code";
import FileUpload from "~/components/common/FileUpload/index.vue";
import { DOCUMENT } from "~/constants/fileType";
import { ApiActionInterface } from "~/interface/plugin/repository";
import { FormDialogInterface } from "~/interface/components/dialog";
import { FileInterface } from "~/interface/data/file";
import ServiceCheckbox from "~/components/common/ServiceCheckbox.vue";
import { TAX_NUMBER_REGEX } from "~/constants/regex";

const DEFAULT_ITEM = {
  username: "",
  full_name: "",
  email: "",
  tax_no: "",
  phone_number: "",
  password: "",
  address: "",
  representative: "",
  business_registration_document: null,
  cooperation_proposal_document: null,
  capacity_statement_document: null,
  services: []
};

interface ItemInterface {
  username: string;
  full_name: string;
  email: string;
  tax_no: string;
  phone_number: string;
  password: string;
  address: string;
  representative: string;
  business_registration_document: FileInterface;
  cooperation_proposal_document: FileInterface;
  capacity_statement_document: FileInterface;
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
  item: ItemInterface;
  confirmPassword: string;
  acceptFileTypes: object;
  user_status: object;
}

interface ComponentMethods {
  show(item: ItemInterface): void;

  onSubmit(): void;

  addItem(): void;

  editItem(): void;

  resetData(): void;
}

const AgencyDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "AgencyDialog",
  components: {
    ServiceCheckbox,
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
      item: cloneDeep(DEFAULT_ITEM),
      confirmPassword: "",
      acceptFileTypes: DOCUMENT,
      user_status: USER_STATUS
    };
  },
  computed: {
    taxNumberRule() {
      return {
        required: true,
        max: 100,
        isTaxNumber: true
      };
    }
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
    async show(item = null) {
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
              capacity_statement_document: newItem.user_info
                .capacity_statement_document
                ? JSON.parse(newItem.user_info.capacity_statement_document)
                : null,
              business_registration_document: newItem.user_info
                .business_registration_document
                ? JSON.parse(newItem.user_info.business_registration_document)
                : null,
              cooperation_proposal_document: newItem.user_info
                .cooperation_proposal_document
                ? JSON.parse(newItem.user_info.cooperation_proposal_document)
                : null
            }
          : {};
        await this.$nextTick();
        this.item = {
          ...userInfo,
          ...newItem
        };
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
        const res = await this.$apiAction.storeAgency({
          ...this.item
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
        const res = await this.$apiAction.updateAgency(this.item);
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
        this.confirmPassword = "";
        this.item = cloneDeep(DEFAULT_ITEM);
        this.$refs.form.reset();
      }, 300);
    }
  }
});

export default AgencyDialog;
export type AgencyDialogRef = InstanceType<typeof AgencyDialog>;
</script>
<style lang="scss">
.registration-upload {
  .v-transmit__upload-area {
    min-height: unset;
    height: 144px;
  }
}
</style>
