<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    content-class="flex xs12 md8 lg7 xl6"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex class="px-2">
        <v-layout wrap>
          <v-flex xs12 class="form-group">
            <v-text-field-with-validation
              v-model="item.name"
              :disabled="isReview"
              :loading="loading"
              :counter="11"
              name="name"
              type="text"
              label="Tên brandname"
              required
              rules="required|max:11|existCharacter|stringBrandName|"
            />
          </v-flex>
          <v-flex xs12 class="form-group">
            <v-text-field-with-validation
              v-model="item.business_name"
              :disabled="isReview"
              :loading="loading"
              :counter="100"
              name="business_name"
              type="text"
              label="Tên doanh nghiệp"
              required
              rules="required|max:100"
            />
          </v-flex>
          <v-flex xs12 class="form-group">
            <business-activity-select
              v-model="item.business_activity"
              :loading="loading"
              :disabled="isReview"
              name="business_activity_id"
              label="Lĩnh vực hoạt động"
              required
              rules="required"
            />
          </v-flex>
          <v-flex sm12 class="form-group">
            <agency-advertiser-select
              v-model="owner"
              :disabled="isReview"
              :loading="loading"
              :query-params="{
                include_me: true
              }"
              required
              rules="required"
              name="agency-advertiser"
              type="text"
              label="Người sở hữu"
            />
          </v-flex>

          <v-flex xs12 class="form-group">
            <v-number-field-with-validation
              v-if="showPrice"
              v-model="item.maintain_fee"
              :loading="loading"
              name="maintain_fee"
              label="Phí brandname"
              suffix="₫"
              rules="min_value:0"
            />
          </v-flex>
          <v-flex xs12 class="form-group">
            <file-upload
              ref="fileUpload"
              v-model="item.documents"
              :disabled="isReview"
              :accept="PDF_AND_IMG"
              required
              :rules="isCreateRequest ? 'required' : ''"
              return-object
              label="Tài liệu"
              name="documents"
              height="200px"
              :maximum="30"
              :max-file-size="20"
            ></file-upload>
          </v-flex>
        </v-layout>
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FileUpload from "@/components/common/FileUpload/index.vue";
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import BusinessActivitySelect from "@/components/select/BusinessActivitySelect.vue";
import ACTIONS from "@/constants/actions";
import { INVENTORY_DISPLAY, TARGETING_TAG } from "@/constants/resource";
import { ROLE_AGENCY } from "@/constants/role";
import cloneDeep from "lodash/cloneDeep";
import { DOCUMENT, PDF_AND_IMG } from "@/constants/fileType";
import Vue, { VueConstructor } from "vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { UserInterface } from "~/interface/data/user";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { BrandnameInterface } from "~/interface/data/brandname";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  isReview: boolean;
  timeout: number;
  loading: boolean;
  resourceInventory: string;
  resourceTag: string;
  owner: UserInterface;
  item: BrandnameInterface;
  $refs: { refFormDialog: FormDialogRef };
  $brandNameRequestRepository: RepositoryInterface;
  $brandNameRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: (item?: BrandnameInterface, isReview?: boolean) => void;
  hidden: () => void;
  editItem: () => void;
  addItem: () => void;
  onSubmit: () => void;
  confirmItem: () => void;
  convertDataToUpdate: () => BrandnameInterface;
}

interface ComponentComputed {
  showPrice: boolean;
  isRequireOwner: boolean;
  agency: UserInterface;
}

const DEFAULT_ITEM = {
  id: null,
  name: "",
  status: "",
  advertiser: null,
  advertiser_id: null,
  agency: null,
  agency_id: null,
  brand_certificate: null,
  business_activity: null,
  business_activity_id: null,
  business_name: "",
  business_registration: null,
  created_at: null,
  deleted_at: null,
  deleted_by: null,
  expire_time: null,
  identify_certificate: null,
  item_permissions: null,
  maintain_fee: 0,
  price_cskh: 0,
  price_mms: 0,
  updated_at: null,
  user_id: null
};

/**
 * @property {Object} $brandNameRepository
 * @property {Object} $brandNameRequestRepository
 */

const BrandNameFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods & ComponentComputed
>).extend({
  name: "BrandNameFormDialog",
  components: {
    VNumberFieldWithValidation,
    BusinessActivitySelect,
    AgencyAdvertiserSelect,
    FileUpload,
    FormDialog,
    VTextFieldWithValidation
  },
  props: {
    isCreateRequest: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      DOCUMENT,
      PDF_AND_IMG,
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      isReview: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      resourceInventory: INVENTORY_DISPLAY,
      resourceTag: TARGETING_TAG,
      owner: null
    };
  },
  computed: {
    showPrice() {
      return (
        this.$can(`manager-brandname-list.${ACTIONS.EDIT}`) &&
        !this.isCreateRequest
      );
    },
    isRequireOwner() {
      return !this.$authHasRole(ROLE_AGENCY);
    },
    agency() {
      return this.item.agency;
    }
  },
  watch: {
    agency() {
      this.item.advertiser = null;
    },
    // ownerItem(val) {
    //   if (val) {
    //     if (!this.owner || val.id !== this.owner.id) {
    //       this.owner = val;
    //     }
    //   } else {
    //     this.owner = null;
    //   }
    // },
    owner(val) {
      if (val?.is_agency) {
        if (val.id !== this.item?.agency?.id) {
          this.item.agency_id = val.id;
          this.item.agency = val;
          this.item.advertiser_id = null;
          this.item.advertiser = null;
        }
      } else if (val?.id !== this.item?.advertiser?.id) {
        const agency = val?.agency;
        this.item.agency_id = agency?.id;
        this.item.agency = agency;
        this.item.advertiser_id = val?.id;
        this.item.advertiser = val;
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null, isReview = false) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        if (item?.advertiser) {
          this.owner = {
            ...item?.advertiser,
            is_agency: false,
            agency: item?.agency
          };
        } else if (item?.agency) {
          this.owner = {
            is_agency: true,
            ...item?.agency
          };
        }
      } else {
        this.owner = null;
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }
      this.isReview = isReview;
      if (this.isCreateRequest) {
        this.title = `${
          this.isEdit ? "Cập nhật" : "Thêm"
        } yêu cầu tạo brandname`;
      } else {
        this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} brandname`;
      }
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      if (isReview) {
        this.title = "Phê duyệt";
        this.labelButtonConfirm = "Phê duyệt";
      }
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    convertDataToUpdate() {
      return {
        ...this.item,
        business_activity_id: this.item?.business_activity?.id
      };
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      this.isReview = false;
      clearTimeout(this.timeout);
    },
    onSubmit() {
      if (this.isReview) {
        this.confirmItem();
        return;
      }
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },
    async confirmItem() {
      this.loading = true;
      try {
        const res = await this.$brandNameRequestRepository.post("confirm", {
          id: this.item.id,
          status: "approve"
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("phê duyệt brandname");
          this.hidden();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    },
    async addItem() {
      this.loading = true;
      try {
        let res;
        if (this.isCreateRequest) {
          res = await this.$brandNameRequestRepository.create(
            this.convertDataToUpdate()
          );
        } else {
          res = await this.$brandNameRepository.create(
            this.convertDataToUpdate()
          );
        }
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          if (this.showPrice) {
            this.$toast.global.add_success("brandname");
          } else {
            this.$toast.global.add_success("yêu cầu tạo brandname");
          }
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    },

    async editItem() {
      this.loading = true;

      try {
        let res;
        if (this.isCreateRequest) {
          res = await this.$brandNameRequestRepository.update(
            this.convertDataToUpdate()
          );
        } else {
          res = await this.$brandNameRepository.update(
            this.convertDataToUpdate()
          );
        }
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          if (this.showPrice) {
            this.$toast.global.edit_success("brandname");
          } else {
            this.$toast.global.edit_success("yêu cầu tạo brandname");
          }
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
          this.$toast.error(e.response?.data?.errors["documents.0"]);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    }
  }
});

export default BrandNameFormDialog;
export type BrandNameFormDialogRef = InstanceType<typeof BrandNameFormDialog>;
</script>
