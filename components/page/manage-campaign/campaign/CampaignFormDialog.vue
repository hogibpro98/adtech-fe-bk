<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    max-width="600px"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <campaign-form-content
        v-model="item"
        :is-edit="isEdit"
        :loading="loading"
      />
    </template>
  </form-dialog>
</template>
<script lang="ts">
import CampaignFormContent from "@/components/page/manage-campaign/campaign/CampaignFormContent";
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { CampaignInterface } from "~/interface/data/campaign";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { UserInterface } from "~/interface/data/user";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";

const DEFAULT_ITEM = {
  id: null,
  name: "",
  start_time: null,
  end_time: null,
  budget: null,
  zone: null,
  zone_id: null
};

interface ComponentData {
  title: string;
  owner: UserInterface;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: CampaignInterface;
  $campaignRepository: RepositoryInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
  $toast: ToastInterface;
}

interface ComponentMethod {
  show(item: CampaignInterface): void;

  hide(): void;

  deleteItem(): void;
}

const CampaignFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "CampaignFormDialog",
  components: {
    CampaignFormContent,
    FormDialog
  },
  data() {
    return {
      title: "",
      owner: null,
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
        if (item.isClone) {
          this.isEdit = false;
          this.item = cloneDeep(item);
          this.title = `Bản sao của ${item.name}`;
          this.labelButtonConfirm = "Thêm";
          this.loading = false;
          this.$refs.refFormDialog.show();
          return;
        } else {
          this.isEdit = true;
          this.item = cloneDeep(item);
        }
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} chiến dịch`;
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
    mapData() {
      if (this.item.zone) {
        this.item.zone_id = this.item.zone.id;
      }
    },
    async addItem() {
      this.loading = true;
      try {
        this.mapData()
        const res = await this.$campaignRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success", res.data);
          this.$toast.global.add_success("chiến dịch");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          const errors = e.response.data.errors || {};
          if (errors.start_time || errors.end_time) {
            errors.period = [
              ...(errors.start_time || []),
              ...(errors.end_time || [])
            ];
          }
          this.$refs.refFormDialog.setErrors(errors);
        }
      }
    },

    async editItem() {
      this.loading = true;

      try {
        this.mapData()
        const res = await this.$campaignRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success", res.data);
          this.$toast.global.edit_success("chiến dịch");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          const errors = e.response.data.errors || {};
          if (errors.start_time || errors.end_time) {
            errors.period = [
              ...(errors.start_time || []),
              ...(errors.end_time || [])
            ];
          }
          this.$refs.refFormDialog.setErrors(errors);
        }
      }
    }
  }
});

export default CampaignFormDialog;
export type CampaignFormDialogRef = InstanceType<typeof CampaignFormDialog>;
</script>
