<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    @on-submit="exportFile"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-select-with-validation
          v-model="mode"
          :items="exportModes"
        ></v-select-with-validation>
      </v-flex>
      <template v-if="mode === 'email'">
        <v-flex xs12 class="form-group">
          <user-select
            v-model="userReceipts"
            :loading="loading"
            :attach="false"
            :agency-id="agencyId"
            :resource="USER_RECEIVER_EXPORT"
            name="agency-advertiser"
            label="Người nhận báo cáo"
            item-value="id"
            :return-object="false"
            required
            rules="required"
            multiple
          >
            <template slot="selection" slot-scope="{ item }">
              <v-chip class="mx-1" small close @click:close="remove(item)">
                {{ item.full_name }}
              </v-chip>
            </template>
          </user-select>
        </v-flex>
        <v-flex xs12 class="form-group">
          <v-text-area-with-validation
            v-model="reportTitle"
            :loading="loading"
            required
            name="title"
            label="Tên báo cáo"
            rules="required|max:100"
            counter="100"
          />
        </v-flex>
      </template>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import {
  INVENTORY_DISPLAY,
  TARGETING_TAG,
  TRANSACTION_REDIRECT_DAILY,
  USER_RECEIVER_EXPORT
} from "@/constants/resource";
import cloneDeep from "lodash/cloneDeep";
import { DOCUMENT } from "@/constants/fileType";
import VTextAreaWithValidation from "@/components/common/VTextAreaWithValidation.vue";
import UserSelect from "@/components/select/UserSelect.vue";
import { ROLE_AGENCY } from "@/constants/role";
import VSelectWithValidation from "@/components/common/VSelectWithValidation.vue";
import { downloadFile } from "@/helpers/ultis";
import Vue, { VueConstructor } from "vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { SettingUserPriceInterface } from "~/interface/data/banner";
import { DataSelectInterface } from "~/interface/data/dataSelect";

const DEFAULT_ITEM = {
  id: "",
  name: ""
};

interface ComponentData {
  USER_RECEIVER_EXPORT: Array<string>;
  DOCUMENT: Array<string>;
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  reportTitle: string;
  item: SettingUserPriceInterface;
  resourceInventory: string;
  resourceTag: string;
  userReceipts: Array<string>;
  mode: string;
  exportModes: Array<DataSelectInterface>;
  agencyId: string | number;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethods {
  show(item: SettingUserPriceInterface): void;
  remove(userId: string): void;
  hidden(): void;
  exportFile(): void;
  export(): void;
  exportEmail(): void;
}

const ExportExpenseRedirectDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ExportExpenseRedirectDialog",
  components: {
    VSelectWithValidation,
    UserSelect,
    VTextAreaWithValidation,
    FormDialog
  },
  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      USER_RECEIVER_EXPORT,
      DOCUMENT,
      title: "",
      labelButtonConfirm: "",
      timeout: null,
      loading: false,
      reportTitle: "",
      item: cloneDeep(DEFAULT_ITEM),
      resourceInventory: INVENTORY_DISPLAY,
      resourceTag: TARGETING_TAG,
      userReceipts: [],
      mode: "self",
      exportModes: [
        {
          text: "Xuất trực tiếp",
          value: "self"
        },
        {
          text: "Gửi qua email",
          value: "email"
        }
      ]
    };
  },
  computed: {
    agencyId() {
      if (this.$authHasRole(ROLE_AGENCY)) {
        return this.$auth.user.id;
      }
      return null;
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      clearTimeout(this.timeout);

      this.item = cloneDeep(item);
      this.title = "Xuất báo cáo";
      this.labelButtonConfirm = "Xác nhận";
      this.userReceipts = [];
      this.reportTitle = "";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    remove(item) {
      this.userReceipts.splice(this.userReceipts.indexOf(item), 1);
      this.userReceipts = [...this.userReceipts];
    },
    hidden() {
      this.mode = "self";
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    exportFile() {
      if (this.mode === "email") {
        this.exportEmail();
      } else {
        this.export();
      }
    },

    async export() {
      this.loading = true;
      try {
        const res = await this.$axios.post(
          `${TRANSACTION_REDIRECT_DAILY}/export`,
          this.filter,
          {
            responseType: "blob"
          }
        );
        console.log(res);
        downloadFile(res);
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    },

    async exportEmail() {
      this.loading = true;
      try {
        const res = await this.$transactionRedirectDailyRepository.post(
          "export-email",
          {
            user_ids: this.userReceipts,
            title: this.reportTitle,
            ...this.filter
          }
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.success("Xuất báo cáo thành công");
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

export default ExportExpenseRedirectDialog;
export type ExportExpenseRedirectDialogRef = InstanceType<
  typeof ExportExpenseRedirectDialog
>;
</script>
