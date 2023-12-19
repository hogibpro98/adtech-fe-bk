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
        <span class="headline pt-3">Xóa gói cước</span>
      </v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa đơn giá dung lượng
        <span class="red--text"> {{ item.capacity | numberSpace }}MB </span> của
        gói cước
        <span class="red--text">
          {{ item.code }}
        </span>
        ?
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
  id: null,
  code: null,
  capacity: null
};

interface ItemInterface {
  id: number;
  code: string;
  capacity: number;
}

interface ComponentData {
  $dataPackageRepository: RepositoryInterface;
  showing: boolean;
  item: ItemInterface;
  loading: boolean;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  resetData(): void;
  deleteItem(): void;
}

const DataPackageDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "DataPackageDeleteDialog",
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
        const res = await this.$dataPackageRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.global.delete_success("gói cước");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default DataPackageDeleteDialog;
export type DataPackageDeleteDialogRef = InstanceType<
  typeof DataPackageDeleteDialog
>;
</script>
