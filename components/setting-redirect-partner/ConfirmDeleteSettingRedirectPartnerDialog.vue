<template>
  <v-dialog v-model="isShow" content-class="flex xs12 sm8 md8 lg5 xl4">
    <v-card>
      <v-card-title>
        Xóa đối tác
      </v-card-title>
      <v-card-text>
        Bạn có chắc muốn xóa đối tác
        <span style="color: red">{{ defaultItem.name }}</span> ?
      </v-card-text>
      <v-card-actions>
        <v-layout justify-end class="px-2 py-2">
          <v-btn color="grey" text @click="hide">
            Hủy
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="primary darken-1"
            text
            @click="handleConfirmDelete"
          >
            Xác nhận
          </v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import { CODE_SUCCESS } from "~/constants/code";

const ConfirmDeleteSettingRedirectPartnerDialog = Vue.extend({
  name: "ConfirmDeleteVendorDialog",
  data() {
    return {
      isShow: false,
      isLoading: false,
      defaultItem: {
        id: null
      }
    };
  },
  methods: {
    async handleConfirmDelete() {
      this.isLoading = true;
      try {
        const result = await this.$axios.post(
          "partner-redirect-service/delete",
          {
            id: this.defaultItem.id
          }
        );
        if (result.data.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("cấu hình rediect ngoại mạng");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.$toast.global.action_fail();
        console.log(e);
      } finally {
        this.isLoading = false;
        this.isShow = false;
      }
    },
    show(item) {
      this.defaultItem = cloneDeep(item);
      this.isShow = true;
    },
    hide() {
      this.isShow = false;
    }
  }
});
export default ConfirmDeleteSettingRedirectPartnerDialog;
</script>

<style scoped></style>
