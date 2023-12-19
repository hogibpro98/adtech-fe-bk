<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm8 md8 lg5 xl4"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.alias"
          :loading="loading"
          name="alias"
          type="text"
          label="Alias"
          required
          rules="required|max:128"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.name"
          :loading="loading"
          name="name"
          type="text"
          label="Tên"
          required
          rules="required|max:128"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-checkbox
          v-model="item.send_mail_now"
          label="Gửi mail thông báo"
          class="ma-0 pa-0 pt-2"
        >
        </v-checkbox>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="redirectPattern"
          :loading="loading"
          name="redirect"
          label="Redirect url"
          rules="Object"
          hint="Định dạng là array, mỗi object và có field: key, text, tags"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="messagePattern"
          :loading="loading"
          name="message"
          label="Nội dung"
          required
          rules="required|requiredObject"
          hint="Định dạng là array, mỗi object và có field: key, text, tags"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { ToastInterface } from "~/interface/plugin/toast";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ConfigNotificationPatternInterface } from "~/interface/data/config";

const DEFAULT_ITEM = {
  id: null,
  name: "",
  message_pattern: [],
  icon_pattern: {},
  redirect_pattern: [],
  alias: []
};

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ConfigNotificationPatternInterface;
  messagePattern: string;
  iconPattern: string;
  redirectPattern: string;
  $toast: ToastInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
  $notificationPatternRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ConfigNotificationPatternInterface): void;

  convertDataToUpdate(): void;

  hidden(): void;

  onSubmit(): void;

  addItem(): void;

  editItem(): void;
}

const NotificationPatternFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "NotificationPatternFormDialog",
  components: {
    FormDialog,
    VTextAreaWithValidation,
    VTextFieldWithValidation
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      messagePattern: "",
      iconPattern: "",
      redirectPattern: ""
    };
  },
  watch: {
    "item.message_pattern"(val) {
      this.messagePattern = JSON.stringify(val);
    },
    "item.icon_pattern"(val) {
      this.iconPattern = JSON.stringify(val);
    },
    "item.redirect_pattern"(val) {
      this.redirectPattern = JSON.stringify(val);
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

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} định dạng thông báo`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    convertDataToUpdate() {
      return {
        id: this.item.id,
        name: this.item.name,
        alias: this.item.alias,
        send_mail_now: this.item.send_mail_now,
        message_pattern: JSON.parse(this.messagePattern),
        icon_pattern: JSON.parse(this.iconPattern),
        redirect_pattern: JSON.parse(this.redirectPattern)
      };
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
        const res = await this.$notificationPatternRepository.create(
          this.convertDataToUpdate()
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("định dạng thông báo");
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
        const res = await this.$notificationPatternRepository.update(
          this.convertDataToUpdate()
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("định dạng thông báo");
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

export default NotificationPatternFormDialog;
export type NotificationPatternFormDialogRef = InstanceType<
  typeof NotificationPatternFormDialog
>;
</script>
