<template>
  <v-dialog v-model="isShow" content-class="flex xs12 sm8 md8 lg5 xl4">
    <v-card>
      <v-card-title>
        Sinh lại Deliver Token
      </v-card-title>
      <v-card-text>
        Bạn có muốn sinh lại Deliver Token ?
      </v-card-text>
      <v-card-actions>
        <v-layout justify-end class="px-2 py-2">
          <v-btn color="grey" text @click="hide">
            Đóng
          </v-btn>
          <v-btn
            :loading="loading"
            color="primary darken-1"
            text
            @click="handleConfirm"
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

interface ComponentData {
  isShow: boolean;
  loading: boolean;
  defaultItem: object;
}
interface ComponentMethod {
  show(item: any): void;
  hide(): void;
  handleConfirm(): void;
}
interface ComponentComputed {}
interface ComponentProps {}
const ConfirmGenDlvrTokenDialog = Vue.extend<
  ComponentData,
  ComponentMethod,
  ComponentComputed,
  ComponentProps
>({
  name: "ConfirmGenDlvrToken",
  data() {
    return {
      isShow: false,
      loading: false,
      defaultItem: {}
    };
  },
  methods: {
    async handleConfirm() {
      this.loading = true;
      try {
        const result = await this.$axios.post("vendor-account/renew-token", {
          id: this.defaultItem.id
        });
        if (result.data.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("sinh lại token");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.$toast.global.action_fail();
        console.log(e);
      } finally {
        this.loading = false;
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
export default ConfirmGenDlvrTokenDialog;
export type ConfirmGenDlvrTokenDialogRef = InstanceType<
  typeof ConfirmGenDlvrTokenDialog
>;
</script>

<style scoped></style>
