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
        <span class="headline pt-3">Xóa đơn giá</span>
      </v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa đơn giá
        <span class="red--text uppercase"> {{ item.service }} </span> của agency
        <span class="red--text">
          {{
            typeof item.agency === "undefined"
              ? item.agency_id
              : item.agency.full_name
          }}
        </span>
        cho lĩnh vực hoạt động
        <span class="red--text">{{ item.cat_id }} </span>?
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

const DEFAULT_ITEM = {
  agency_id: null,
  cat_id: "",
  service: ""
};

interface ItemInterface {
  agency_id: number;
  cat_id: string;
  service: string;
}

interface ComponentData {
  $priceServiceRepository: RepositoryInterface;
  showing: boolean;
  item: ItemInterface;
  loading: boolean;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  resetData(): void;
  deleteItem(): void;
}

const PriceServiceDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PriceServiceDeleteDialog",
  data() {
    return {
      showing: false,
      item: cloneDeep(DEFAULT_ITEM),
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
      this.item = cloneDeep(item);
      this.showing = true;
    },

    resetData() {
      this.item = cloneDeep(DEFAULT_ITEM);
    },

    async deleteItem() {
      this.loading = true;
      try {
        const res = await this.$priceServiceRepository.delete({
          agency_id: this.item.agency_id,
          cat_id: this.item.cat_id,
          service: this.item.service
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.global.delete_success("đơn giá");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default PriceServiceDeleteDialog;
export type PriceServiceDeleteDialogRef = InstanceType<
  typeof PriceServiceDeleteDialog
>;
</script>
