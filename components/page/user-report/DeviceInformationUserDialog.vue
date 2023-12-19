<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Thông tin thiết bị người dùng phản hồi"
    label-button-confirm=""
    label-button-cancel="Đóng"
  >
    <template slot="content">
      <v-list v-for="item in showInfo" :key="item.title">
        <v-list-group
          v-model="item.active"
          :prepend-icon="item.action"
          no-action
        >
          <template #activator>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item v-for="field in item.fields" :key="field">
            <v-list-item-content>
              <v-list-item-title
                v-text="`${field}: ${getGroupKey(item.title, field)}`"
              ></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>
    </template>
  </confirm-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import UAParser from "ua-parser-js";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  item: object;
  loading: boolean;
  $refs: { refConfirmDialog: ConfirmDialogRef };
}

interface ComponentMethods {
  hide: Function;
  show: Function;
}

const DeviceInformationUserDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    ConfirmDialog
  },
  data() {
    return {
      showInfo: [
        {
          title: "browser",
          action: "web",
          fields: ["major", "name", "version"],
          active: true
        },
        {
          title: "cpu",
          action: "memory",
          fields: ["architecture"],
          active: false
        },
        {
          title: "device",
          action: "smartphone",
          fields: ["model", "type", "vendor"],
          active: false
        },
        {
          title: "engine",
          action: "precision_manufacturing",
          fields: ["name", "version"],
          active: false
        },
        {
          title: "os",
          action: "window",
          fields: ["name", "version"],
          active: false
        }
      ],
      userAgent: ""
    };
  },
  computed: {
    information() {
      if (this.userAgent) {
        return UAParser(this.userAgent);
      }
      return {};
    }
  },
  methods: {
    getGroupKey(key, field) {
      const group = this.information?.[key] || {};
      return group[field] || "Không xác định";
    },
    show(newUserAgent) {
      this.userAgent = newUserAgent;
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
    }
  }
});
export default DeviceInformationUserDialog;
export type DeviceInformationUserDialogRef = InstanceType<
  typeof DeviceInformationUserDialog
>;
</script>

<style scoped></style>
