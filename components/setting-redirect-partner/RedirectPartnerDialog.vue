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
          v-model="item.code"
          :loading="loading"
          name="code"
          label="Mã"
          required
          counter="100"
          rules="required|max:100|isCodeRedirect"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.name"
          :loading="loading"
          name="name"
          label="Tên công ty"
          counter="500"
          required
          rules="required|max:500"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.email"
          :loading="loading"
          name="email"
          label="Địa chỉ email"
          required
          counter="100"
          rules="required|email|max:100"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { ToastInterface } from "~/interface/plugin/toast";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ZoneInterface } from "~/interface/data/zone";

const DEFAULT_ITEM = {
  name: "",
  code: "",
  email: ""
};

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ZoneInterface;
  $toast: ToastInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
  $zoneRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ZoneInterface): void;

  hidden(): void;

  onSubmit(): void;

  convertDataToUpdate(item: ZoneInterface): object;

  addItem(): void;

  editItem(): void;
}

const RedirectPartnerDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RedirectPartnerFormDialog",
  components: {
    FormDialog,
    VTextFieldWithValidation
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
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

      this.title = `${
        this.isEdit ? "Cập nhật" : "Thêm"
      } thông tin đối tác`;
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
    convertDataToUpdate(item) {
      return {
        ...item,
        channel_id: item?.channel?.id,
        ads_type_id: item?.ads_type?.id,
        layout_id: item?.layout?.id
      };
    },
    async addItem() {
      this.loading = true;
      try {
        const res = await this.$axios.post(
          "partner-redirect-service/store",
          this.item
        );
        console.log("res", res);
        this.loading = false;
        if (res.data.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("cấu hình redirect đối tác");
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
        const res = await this.$axios.post(
          "partner-redirect-service/update",
          this.item
        );
        this.loading = false;
        if (res.data.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("cấu hình redirect đối tác");
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

export default RedirectPartnerDialog;
export type ZoneFormDialogRef = InstanceType<typeof RedirectPartnerDialog>;
</script>
