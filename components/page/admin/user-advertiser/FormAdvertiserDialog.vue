<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.name"
          :loading="loading"
          name="name"
          type="text"
          label="Tên doanh nghiệp"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.unit_register"
          :loading="loading"
          name="unit_register"
          type="text"
          label="Mã số thuế"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.address"
          name="address"
          label="Địa chỉ"
          :loading="loading"
          :counter="500"
          rows="3"
          rules="max:500"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.district"
          :loading="loading"
          name="province"
          type="text"
          label="Người đại diện"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="item.district"
          :loading="loading"
          name="province"
          type="text"
          label="Số điện thoại"
          rules="phone"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="item.district"
          :loading="loading"
          name="province"
          type="text"
          label="Email"
          rules="required|email"
          required
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <agency-advertiser-select
          v-model="owner"
          :loading="loading"
          :query-params="{
            include_me: true
          }"
          name="agency-advertiser"
          type="text"
          label="Người sở hữu"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <file-upload
          v-model="item.file_contract"
          :accept="DOCUMENT"
          label="Tài liệu đính kèm"
          name="file_contract"
          height="150px"
        ></file-upload>
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FileUpload from "@/components/common/FileUpload/index";
import FormDialog from "@/components/common/FormDialog";
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import VTextAreaWithValidation from "@/components/common/VTextAreaWithValidation";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { INVENTORY_DISPLAY, TARGETING_TAG } from "@/constants/resource";
import cloneDeep from "lodash/cloneDeep";
import { DOCUMENT } from "@/constants/fileType";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { FormDialogInterface } from "~/interface/components/dialog";
import { FileInterface } from "~/interface/data/file";
import { UserInterface } from "~/interface/data/user";

const DEFAULT_ITEM = {
  id: "",
  name: "",
  unit_register: "",
  file_contract: null,
  province: "",
  district: "",
  expire_time: null,
  maintain_fee: null,
  advertiser_id: null,
  agency_id: null
};

interface ItemInterface {
  id: string;
  name: string;
  unit_register: string;
  file_contract: FileInterface;
  province: string;
  district: string;
  expire_time: number;
  maintain_fee: number;
  advertiser_id: string;
  agency_id: string;
}

interface ComponentData {
  $brandNameRepository: RepositoryInterface;
  $refs: {
    refFormDialog: FormDialogInterface;
  };
  DOCUMENT: string;
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ItemInterface;
  resourceInventory: string;
  resourceTag: string;
  owner: UserInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  hidden(): void;
  onSubmit(): void;
  addItem(): void;
  editItem(): void;
}

const FormAdvertiserDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "FormAdvertiserDialog",
  components: {
    VTextAreaWithValidation,
    VNumberFieldWithValidation,
    AgencyAdvertiserSelect,
    FileUpload,
    FormDialog,
    VTextFieldWithValidation
  },
  data() {
    return {
      DOCUMENT,
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      resourceInventory: INVENTORY_DISPLAY,
      resourceTag: TARGETING_TAG,
      owner: null
    };
  },
  computed: {
    ownerItem() {
      return this.item.advertiser || this.item.agency || null;
    }
  },
  watch: {
    owner(val) {
      if (val.is_agency) {
        if (val.id !== this.item.agency_id) {
          this.item.agency_id = val.id;
          this.item.agency = val;
          this.item.advertiser_id = null;
          this.item.advertiser = null;
        }
      } else if (val.id !== this.item.advertiser_id) {
        const agency = val.agency || {};
        this.item.agency_id = agency.id;
        this.item.agency = agency;
        this.item.advertiser_id = val.id;
        this.item.advertiser = val;
      }
    },
    ownerItem(val) {
      if (val) {
        if (!this.owner || val.id !== this.owner.id) {
          this.owner = val;
        }
      } else {
        this.owner = null;
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} tên hiển thị sms`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
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
        const res = await this.$brandNameRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("tên hiển thị sms");
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
        const res = await this.$brandNameRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("tên hiển thị sms");
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
    }
  }
});

export default FormAdvertiserDialog;
export type FormAdvertiserDialogRef = InstanceType<typeof FormAdvertiserDialog>;
</script>
