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
        <span class="headline">Xóa whitelist IP</span>
      </v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa ip
        <span class="red--text"> {{ item.ip }} </span> cho nhóm người dùng
        <span class="red--text"> {{ item.role.display_name }} </span>
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
import { RolesInterface } from "~/interface/data/permission";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { CODE_SUCCESS } from "~/constants/code";

const DEFAULT_ITEM = {
  id: null,
  ip: "",
  role: {
    id: "",
    display_name: ""
  },
  role_id: null
};

interface ItemInterface {
  id: string;
  ip: string;
  role: RolesInterface;
  role_id: string;
}

interface ComponentData {
  $whitelistIpRepository: RepositoryInterface;
  showing: boolean;
  item: ItemInterface;
  loading: boolean;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  resetData(): void;
  deleteItem(): void;
}

const WhitelistIpDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "WhitelistIpDeleteDialog",
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
        const res = await this.$whitelistIpRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.global.delete_success("quyền");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default WhitelistIpDeleteDialog;
export type WhitelistIpDeleteDialogRef = InstanceType<
  typeof WhitelistIpDeleteDialog
>;
</script>
