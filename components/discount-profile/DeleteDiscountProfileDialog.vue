<template>
  <v-dialog v-model="isShow"
    content-class="flex xs12 sm8 md6 lg5 xl4"
  >
    <v-card>
      <v-card-title>
        Xóa Chiết khấu
      </v-card-title>
      <v-card-text>
        Bạn có chắc muốn xóa chiết khấu <span style="color:red">{{defaultItem.name}}</span> ?
      </v-card-text>
      <v-card-actions>
        <v-layout justify-end class="px-2 py-2">
          <v-btn color="grey" text @click="hide">
            Hủy
          </v-btn>
          <v-btn
            :loading="loading"
            color="primary darken-1"
            text
            @click="handleSubmit"
          >
            Xác nhận
          </v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue"
import {cloneDeep} from "lodash";
import {CODE_SUCCESS} from "~/constants/code";

const DeleteDiscountProfileDialog = Vue.extend({
  name: "DeleteDiscountProfileDialog",
  data() {
    return {
      isShow: false,
      loading: false,
      defaultItem: {}
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      try {
        const result = await this.$axios.$post('discount-profile/delete', {
          id: this.defaultItem.id,
        })
        console.log(result)
        if (result.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("discount profile");
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
    hide() {
      this.isShow = false;
    },
    show(item) {
      this.defaultItem = cloneDeep(item);
      this.isShow = true;
    }
  }
})
export default DeleteDiscountProfileDialog;
export type DeleteDiscountProfileDialogRef = InstanceType<typeof DeleteDiscountProfileDialog>
</script>

<style scoped>

</style>
