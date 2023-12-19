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
        <span class="headline">Xóa nhóm người dùng</span>
      </v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa nhóm người dùng
        <span class="red--text"> {{ item.name }} </span>
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
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { CODE_SUCCESS } from "~/constants/code";
import { isGlobalStatus } from "~/helpers/ultis";

const DEFAULT_ITEM = {
  id: null,
  name: ""
};

interface ItemInterface {
  id: string;
  name: string;
}

interface ComponentData {
  showing: boolean;
  item: ItemInterface;
  loading: boolean;
  $roleRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  resetData(): void;
  deleteItem(): void;
}

const RoleDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RoleDeleteDialog",
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
        const res = await this.$roleRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.global.delete_success("nhóm người dùng");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (!isGlobalStatus(e.response.status)) {
          this.$toast.global.action_fail();
        }
      }
    }
  }
});

export default RoleDeleteDialog;
export type RoleDeleteDialogRef = InstanceType<typeof RoleDeleteDialog>;
</script>
