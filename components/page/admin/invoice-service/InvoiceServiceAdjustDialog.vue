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
        <span class="headline pt-3">Điều chỉnh hoá đơn</span>
      </v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn điều chỉnh hóa đơn
        <span class="red--text"> {{
            item.name === null
              ? ""
              : item.name
          }} </span> có mã giao dịch
        <span class="red--text">
          {{
            item.id === null
              ? ""
              : item.id
          }}
        </span>?
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
import { RepositoryInterface } from "~/interface/plugin/repository";
import { CODE_SUCCESS } from "~/constants/code";

interface ComponentData {
  $priceServiceRepository: RepositoryInterface;
  showing: boolean;
  item: any;
  loading: boolean;
}

interface ComponentMethods {
  show(item: any): void;
  resetData(): void;
  deleteItem(): void;
}

const InvoiceServiceAdjustDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
  >).extend({
  name: "PriceServiceDeleteDialog",
  data() {
    return {
      showing: false,
      item: {},
      loading: false
    };
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
      this.item = item;
      this.showing = true;
    },

    resetData() {
      this.item = {};
    },

    async deleteItem() {
      this.loading = true;
      try {
        const res = {code: CODE_SUCCESS}
        // const res = await this.$priceServiceRepository.delete({
        //   agency_id: this.item.agency_id,
        //   cat_id: this.item.cat_id,
        //   service: this.item.service
        // });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.success("Điều chỉnh hóa đơn thành công");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default InvoiceServiceAdjustDialog;
export type InvoiceServiceAdjustDialogRef = InstanceType<
  typeof InvoiceServiceAdjustDialog
  >;
</script>
