<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    min-width="400"
    max-width="600"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline">Xoá tài khoản</span>
      </v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn
        <span class="error--text">xóa</span>
        tài khoản
        <span class="error--text">
          {{ item.username }}
        </span>
        ?
      </v-card-text>
      <v-card-text>
        Lưu ý: Tài khoản bị xóa vẫn sẽ hiển thị trên thông tin báo cáo, nên tên
        tài khoản bị xóa vẫn không thể sử dụng cho tài khoản mới.
      </v-card-text>
      <v-card-actions>
        <v-layout justify-end>
          <v-btn color="grey" text @click.native="showing = false">Hủy</v-btn>
          <v-btn
            :loading="loading"
            color="primary darken-1"
            text
            @click.native="deleteItem"
          >
            Xác nhận
          </v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import {
  DialogInterface,
  FormDialogInterface
} from "@/interface/components/dialog";
import { CODE_SUCCESS, USER_STATUS } from "~/constants/code";

const DEFAULT_ITEM = {
  id: null,
  username: ""
};

const UserDeleteDialog = (Vue as VueConstructor<
  Vue & DialogInterface & FormDialogInterface
>).extend({
  name: "UserDeleteDialog",
  data() {
    return {
      showing: false,
      item: cloneDeep(DEFAULT_ITEM),
      loading: false
    };
  },
  computed: {
    isLocked() {
      return this.item.status === USER_STATUS.DELETED;
    }
  },
  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  methods: {
    show(item) {
      this.item = cloneDeep(item);
      this.showing = true;
    },

    resetData() {
      this.item = cloneDeep(DEFAULT_ITEM);
    },

    async deleteItem() {
      this.loading = true;
      try {
        const res = await this.$userRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.success("Xóa người dùng thành công!");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default UserDeleteDialog;
export type UserDeleteDialogRef = InstanceType<typeof UserDeleteDialog>;
</script>
