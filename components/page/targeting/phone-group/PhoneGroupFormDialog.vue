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
          v-model="item.name"
          :loading="loading"
          :counter="100"
          rules="required|max:100"
          name="name"
          type="text"
          label="Tên"
          required
        />
      </v-flex>
      <v-flex v-if="isAdmin" xs12 class="form-group">
        <agency-advertiser-select
          v-model="item.user"
          :loading="loading"
          rules="required"
          name="user"
          type="text"
          required
          label="Người sở hữu"
        ></agency-advertiser-select>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-select-with-validation
          v-model="item.type"
          :loading="loading"
          rules="required"
          name="type"
          label="Loại"
          :items="types"
        ></v-select-with-validation>
      </v-flex>
      <v-row class="no-margin">
        <v-flex xs12>
          <file-upload
            v-model="item.target_file"
            :accept="DOCUMENT_CSV_TXT"
            name="target_file"
            display-label="Danh sách thuê bao nhận tin nhắn (.csv, .txt)"
            label="Danh sách thuê bao nhận tin nhắn"
            required
            rules="required"
          />
        </v-flex>
        <v-card-subtitle
          class="no-padding caption text-center max-w-2xl mt-8 m-auto"
        >
          Danh sách thuê bao nhận tin nhắn phải có định dạng csv hoặc txt
          <br />
          Mỗi thuê bao sẽ nằm trên 1 dòng riêng biệt
        </v-card-subtitle>
      </v-row>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { FormDialogRef } from "../../common/FormDialog.vue";
import {
  PhoneGroupInterface,
  PhoneGroupInterface
} from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import FileUpload from "~/components/common/FileUpload/index.vue";
import { DOCUMENT_CSV_TXT } from "~/constants/fileType";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import { ROLE_IS_ADMIN } from "~/constants/role";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: PhoneGroupInterface;
  $refs: { refFormDialog: FormDialogRef };
  $phoneGroupRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hidden: Function;
  editItem: Function;
  addItem: Function;
  onSubmit: Function;
}

const DEFAULT_ITEM = {
  id: null,
  name: "",
  user: null,
  user_id: null,
  targeting_file: null,
  type: "white"
};

/**
 * @property {Object} $phoneGroupRepository
 */

const PhoneGroupFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PhoneGroupFormDialog",
  components: {
    VSelectWithValidation,
    AgencyAdvertiserSelect,
    FileUpload,
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
      DOCUMENT_CSV_TXT,
      item: cloneDeep(DEFAULT_ITEM),
      types: [
        {
          text: "Whitelist",
          value: "white"
        },
        {
          text: "Blacklist",
          value: "black"
        }
      ]
    };
  },
  computed: {
    isAdmin() {
      return this.$authHasRole(ROLE_IS_ADMIN);
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

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} nhóm điện thoại`;
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
        const res = await this.$phoneGroupRepository.create({
          ...this.item,
          user_id: this.item.user?.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("nhóm điện thoại");
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
        const res = await this.$phoneGroupRepository.update({
          ...this.item,
          user_id: this.item.user?.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("nhóm điện thoại");
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

export default PhoneGroupFormDialog;
export type PhoneGroupFormDialogRef = InstanceType<typeof PhoneGroupFormDialog>;
</script>
