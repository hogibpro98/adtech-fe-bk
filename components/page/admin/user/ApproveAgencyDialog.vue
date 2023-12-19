<template>
  <confirm-dialog
    ref="dialog"
    :loading="loading"
    :title="dialogTitle"
    v-on="$listeners"
  >
    <div slot="content">
      <div class="pb-4">
        Bạn có chắc chắn phê duyệt đăng ký của tài khoản
        <span class="error--text py-2">{{ user.username }}</span> không?
      </div>
      <div class="row">
        <span class="col-5 py-0">Email:</span>
        <span class="font-weight-bold col-7 py-0">{{ user.email }}</span>
      </div>
      <div class="row">
        <span class="col-5 py-0">Tên doanh nghiệp:</span>
        <span class="font-weight-bold col-7 py-0">{{ user.full_name }}</span>
      </div>
      <div class="row">
        <span class="col-5 py-0">Số điện thoại:</span>
        <span class="font-weight-bold col-7 py-0">{{ user.phone_number }}</span>
      </div>
      <div class="row">
        <span class="col-5 py-0">Nhóm người dùng:</span>
        <span class="font-weight-bold col-7 py-0">{{
          user.roles && user.roles.length > 0
            ? user.roles[0].display_name
            : "Chưa có nhóm người dùng"
        }}</span>
      </div>
      <div class="row">
        <span class="col-5 py-0">Địa chỉ:</span>
        <span class="font-weight-bold col-7 py-0">{{
          user.user_info && user.user_info.address
        }}</span>
      </div>
      <div class="row">
        <span class="col-5 py-0">Người đại diện:</span>
        <span class="font-weight-bold col-7 py-0">{{
          user.user_info && user.user_info.representative
        }}</span>
      </div>
      <div class="row">
        <span class="col-5 py-0">Mã số thuế:</span>
        <span class="font-weight-bold col-7 py-0">{{
          user.user_info && user.user_info.tax_no
        }}</span>
      </div>

      <div class="row">
        <span class="col-5 py-0">Công văn hợp tác kinh doanh:</span>
        <span
          class="col-7 py-0"
          v-html="
            user.user_info
              ? renderFile(user.user_info.cooperation_proposal_document)
              : ''
          "
        ></span>
      </div>
      <div class="row">
        <span class="col-5 py-0">Giấy phép đăng ký kinh doanh:</span>
        <span
          class="col-7 py-0"
          v-html="
            user.user_info
              ? renderFile(user.user_info.business_registration_document)
              : ''
          "
        ></span>
      </div>
      <div class="row">
        <span class="col-5 py-0">Hồ sơ năng lực:</span>
        <span
          class="col-7 py-0"
          v-html="
            user.user_info
              ? renderFile(user.user_info.capacity_statement_document)
              : ''
          "
        ></span>
      </div>
    </div>
  </confirm-dialog>
</template>

<script lang="ts">
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import { renderFile } from "@/helpers/ultis";
import Vue, { VueConstructor } from "vue";
import { USER_STATUS } from "~/constants/code";
import { FormDialogInterface } from "~/interface/components/dialog";
import { FileInterface } from "~/interface/data/file";
interface ComponentData {
  $refs: {
    dialog: FormDialogInterface;
  };
}

interface ComponentMethods {
  renderFile(file: FileInterface): string;
  show(): void;
  hide(): void;
}

const ApproveAgencyDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ApproveAgencyDialog",
  components: { ConfirmDialog },
  props: {
    user: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: () => false
    }
  },
  computed: {
    dialogTitle() {
      return this.user?.status === USER_STATUS.VERIFIED
        ? "Gửi lại email kích hoạt"
        : "Phê duyệt đăng ký";
    }
  },
  methods: {
    renderFile(file) {
      return renderFile(file);
    },
    show() {
      this.$refs.dialog.show();
    },
    hide() {
      this.$refs.dialog.hide();
    }
  }
});

export default ApproveAgencyDialog;
export type ApproveAgencyDialogRef = InstanceType<typeof ApproveAgencyDialog>;
</script>
