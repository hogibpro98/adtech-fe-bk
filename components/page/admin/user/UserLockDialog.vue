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
        <span v-if="isLocked" class="headline">Mở khóa tài khoản</span>
        <span v-else class="headline">Khóa tài khoản</span>
      </v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn
        <span v-if="isLocked" class="success--text">mở khóa</span>
        <span v-else class="error--text">khóa</span>
        tài khoản
        <span class="error--text">
          {{ item.username }}
        </span>
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

const UserLockDialog = (Vue as VueConstructor<
  Vue & DialogInterface & FormDialogInterface
>).extend({
  name: "UserLockDialog",
  data() {
    return {
      showing: false,
      item: cloneDeep(DEFAULT_ITEM),
      loading: false
    };
  },
  computed: {
    isLocked() {
      return this.item.status === USER_STATUS.LOCKED;
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
        let res;
        if (this.isLocked) {
          res = await this.$userRepository.post("unlocked", {
            id: this.item.id
          });
        } else {
          res = await this.$userRepository.post("locked", {
            id: this.item.id
          });
        }
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          if (this.isLocked) {
            this.$toast.success("Mở khóa người dùng thành công!");
          } else {
            this.$toast.success("Khóa người dùng thành công!");
          }
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default UserLockDialog;
export type UserLockDialogRef = InstanceType<typeof UserLockDialog>;
</script>
