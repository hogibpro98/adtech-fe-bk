<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    content-class="flex xs12 md10 xl6"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline"
          >{{ isEdit ? "Cập nhật" : "Thêm" }} template SMS</span
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
                <v-flex sm6 class="form-group pr-3 mt-0">
                  <v-flex xs12>
                    <user-select
                      v-if="$authHasRole(['admin', 'super_admin'])"
                      v-model="item.user"
                      name="user_id"
                      label="Người sở hữu"
                      required
                      rules="required"
                      :type="['advertiser', 'agency']"
                    />
                  </v-flex>
                  <v-flex xs12>
                    <v-checkbox
                      v-if="$authHasRole(['admin', 'super_admin'])"
                      v-model="item.template_type"
                      name="template_type"
                      label="Tin xác nhận cộng data"
                      :false-value="0"
                      :true-value="1"
                      class="ma-0 pa-0 pt-2 "
                    >
                    </v-checkbox>
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field-with-validation
                      v-model="item.name"
                      :counter="255"
                      name="name"
                      label="Tên template"
                      required
                      rules="required|max:255"
                    />
                  </v-flex>
                  <v-flex xs12>
                    <business-activity-select
                      v-model="item.cat_id"
                      :attach="true"
                      name="cat_id"
                      label="Lĩnh vực hoạt động"
                      :query-params="paramQueryUserId"
                      required
                      rules="required"
                      item-value="name"
                      type="sms"
                      :return-object="false"
                    />
                  </v-flex>
                  <v-flex xs12>
                    <select-type-m-m-s
                      v-model="item.sms_type"
                      :counter="255"
                      :attach="true"
                      name="sms_type"
                      label="Loại quảng cáo"
                      required
                      rules="required|max:255"
                    />
                  </v-flex>
                  <v-flex xs12>
                    <brandname-select
                      v-model="item.brandname"
                      :attach="true"
                      :query-params="paramQueryUserId"
                      name="brandname"
                      label="Brandname"
                      required
                      rules="required"
                      item-value="name"
                    />
                  </v-flex>
                  <v-checkbox
                    v-model="item.content_type"
                    :label="'Tin nhắn động'"
                    class="ma-0 pa-0 pt-2"
                  >
                  </v-checkbox>
                  <v-flex xs12 class="mt-2">
                    <v-text-area-appendable-with-validation
                      v-model="item.content"
                      :loading="loading"
                      name="content"
                      :counter="500"
                      rows="5"
                      :dynamic="item.content_type"
                      :tooltip-mess="'Thêm trường động'"
                      :dialog-title="'Thêm trường động'"
                      dense
                      required
                      rules="required|max:500"
                      label="Nội dung"
                    >
                    </v-text-area-appendable-with-validation>
<!--                    <v-text-area-with-validation-->
<!--                      v-else-->
<!--                      v-model="item.content"-->
<!--                      name="content"-->
<!--                      rows="5"-->
<!--                      label="Nội dung"-->
<!--                      :counter="500"-->
<!--                      required-->
<!--                      rules="required|max:500"-->
<!--                    />-->
                  </v-flex>
                </v-flex>
                <v-flex sm6 class="form-group pl-2 mt-0">
                  <preview-banner-m-m-s
                    :display-size="displaySize"
                    :loading="loading"
                    :header="item.content"
                    class="mt-4"
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
import RoleSelect from "@/components/select/RoleSelect.vue";
import Vue, { VueConstructor } from "vue";
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
  id: null,
  name: "",
  user: null,
  user_id: null,
  cat_id: null,
  content: null,
  header: "",
  content_type: false,
  sms_type: 0
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

const SmsTemplateFormDialog = (Vue as VueConstructor<
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
    paramQueryUserId() {
      if (this.item.user) {
        return {
          custom_user_id: this.item.user.id
        };
      }
      return {};
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
    show(item = null) {
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
        this.mapData();
        const res = await this.$templateSmsRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("create-success");
          this.$toast.global.add_success("template SMS");
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
        this.mapData();
        const res = await this.$templateSmsRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("update-success");
          this.$toast.global.edit_success("template SMS");
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

export default SmsTemplateFormDialog;
export type SmsTemplateFormDialogRef = InstanceType<
  typeof SmsTemplateFormDialog
>;
</script>
