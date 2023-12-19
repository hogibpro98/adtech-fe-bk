<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn từ chối phản hồi người dùng?"
    label-button-confirm="Gửi"
    @confirm="confirmItem"
  >
    <template slot="content">
      Bạn hãy mô tả lý do từ chối phản hồi của người dùng
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.content"
          :loading="loading"
          :counter="500"
          name="content"
          label="Mô tả phản hồi"
          rows="5"
          required
          rules="required|max:500"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <file-upload
          v-model="item.file"
          :accept="acceptImage"
          return-object
          height="170px"
          name="file"
          label="Ảnh chụp đính kèm"
        />
      </v-flex>
    </template>
  </confirm-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import FileUpload from "~/components/common/FileUpload/index.vue";
import { IMAGE } from "~/constants/fileType";
import { RepositoryInterface } from "~/interface/plugin/repository";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  item: object;
  loading: boolean;
  $refs: { refConfirmDialog: ConfirmDialogRef };
  $feedbackRepository: RepositoryInterface;
}

interface ComponentMethods {
  hide: Function;
  show: Function;
  confirmItem: Function;
}

const DEFAULT_ITEM = {
  id: null,
  file: null,
  content: ""
};

const RejectReportUserDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    FileUpload,
    VTextAreaWithValidation,
    ConfirmDialog
  },
  data() {
    return {
      loading: false,
      acceptImage: IMAGE,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  methods: {
    show(item) {
      this.item.id = item?.id;
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.item = cloneDeep(DEFAULT_ITEM);
      this.$refs.refConfirmDialog.hide();
    },
    async confirmItem() {
      try {
        this.loading = true;
        const res = await this.$feedbackRepository.changeStatus({
          id: this.item.id,
          content: this.item.content,
          file: this.item.file,
          status: "reject"
        });
        if (res.code === CODE_SUCCESS) {
          this.$emit("confirm");
          this.$toast.global.action_success("từ chối");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refConfirmDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
        }
      }
    }
  }
});
export default RejectReportUserDialog;
export type RejectReportUserDialogRef = InstanceType<
  typeof RejectReportUserDialog
>;
</script>

<style scoped></style>
