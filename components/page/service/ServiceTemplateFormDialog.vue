<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    content-class="flex xs10 md8 xl4"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline"
          >{{ isEdit ? "Cập nhật" : "Thêm mới" }} dịch vụ</span
        >
      </v-card-title>
      <v-card-text>
        <v-container>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form @submit.prevent="handleSubmit(onSubmit)">
              <v-row
                id="step-information-banner-mms"
                class="no-margin w-full justify-content-center"
              >
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.name"
                    :counter="255"
                    name="name"
                    label="Tên dịch vụ"
                    required
                    rules="required|max:255"
                    :disabled="isEdit"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.display_name"
                    :counter="255"
                    name="display_name"
                    label="Tên hiển thị"
                    required
                    rules="required|max:255"
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.bccs_id"
                    :counter="255"
                    name="bccs_id"
                    label="Mã mặt hàng BCCS"
                    required
                    rules="required|max:255"
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-area-with-validation
                    v-model="item.description"
                    name="description"
                    label="Mô tả"
                    required
                    rules="required"
                  />
                </v-flex>
              </v-row>
              <v-layout justify-end class="mt-2  z-10 background px-8 py-2">
                <v-btn color="grey" text @click.native="showing = false">
                  Hủy
                </v-btn>
                <v-btn
                  :loading="loading"
                  color="primary darken-1"
                  class="mr-0"
                  text
                  type="submit"
                >
                  Đồng ý
                </v-btn>
              </v-layout>
            </form>
          </validation-observer>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import RoleSelect from "~/components/select/RoleSelect.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogInterface } from "~/interface/components/dialog";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { RolesInterface } from "~/interface/data/permission";
import ContentMMSWithValidation from "~/components/page/manage-campaign/banner/common/ContentMMSWithValidation.vue";
import PreviewBannerMMS from "~/components/page/manage-campaign/banner/common/PreviewBannerMMS.vue";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import BrandnameSelect from "~/components/select/BrandnameSelect.vue";
import SelectTypeMMS from "~/components/page/manage-campaign/banner/common/SelectTypeMMS.vue";
import VTextAreaAppendableWithValidation from "~/components/common/VTextAreaAppendableWithValidation.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import UserSelect from "~/components/select/UserSelect.vue";

const DEFAULT_ITEM = {
  name: "",
  display_name: "",
  bccs_id: "",
  description: ""
};

interface ItemInterface {
  ip: string;
  role: RolesInterface;
  role_id: string;
}

interface ComponentData {
  $whitelistIpRepository: RepositoryInterface;
  $refs: {
    form: FormDialogInterface;
  };
  showing: boolean;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ItemInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;

  onSubmit(): void;

  editItem(): void;

  addItem(): void;

  resetData(): void;
}

const ServiceTemplateFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SmsTemplateFormDialog",
  components: {
    UserSelect,
    VTextAreaWithValidation,
    VTextAreaAppendableWithValidation,
    SelectTypeMMS,
    BrandnameSelect,
    AgencyAdvertiserSelect,
    BusinessActivitySelect,
    PreviewBannerMMS,
    ContentMMSWithValidation,
    VTextFieldWithValidation,
    RoleSelect
  },
  data() {
    return {
      showing: false,
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      displaySize: {
        width: 300,
        height: 200,
        image_src: null
      }
    };
  },
  computed: {
    brandnameParams() {
      return {
        custom_user_id: this.item?.user?.id
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
    show(item) {
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        this.item.header = item.mms_header;
      }

      this.showing = true;
    },

    clone(item = null) {
      if (item) {
        const template = cloneDeep(item);
        template.name = "Bản sao " + template.name;
        this.item = template;
        this.item.header = template.mms_header;
        this.item.template_type = 0;
        this.showing = true;
      }
    },

    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },

    mapData() {
      this.item.user_id = this.item.user?.id || this.$auth.user.id;
      this.item.brandname_id = this.item.brandname.id;
    },

    async addItem() {
      this.loading = true;

      try {
        // this.mapData();

        const res = await this.$axios.post(
          "/service/store",
          this.item
        );

        this.loading = false;
        if (res.status === 200) {
          this.showing = false;
          this.$emit("create-success");
          this.$toast.global.add_success("dịch vụ");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
        }
      }
    },

    async editItem() {
      this.loading = true;
      try {
        // this.mapData();

        const res = await this.$axios.post(
          "/service/update",
          this.item
        );
        this.loading = false;
        if (res.status === 200) {
          this.showing = false;
          this.$emit("update-success");
          this.$toast.global.edit_success("dịch vụ");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
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

export default ServiceTemplateFormDialog;
// export type CrudTemplateFormDialog = InstanceType<
//   typeof CrudTemplateFormDialog
//   >;
</script>
