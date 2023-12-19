<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :loading="loading"
    :retain-focus="false"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template slot="actions">
      <v-layout v-if="!$scopedSlots.actions" justify-end>
        <v-btn
          color="blue darken-1"
          class="mr-0"
          text
          type="submit"
          @click="hidden"
        >
          Đóng
        </v-btn>
      </v-layout>
    </template>
    <template slot="content">
      <v-flex xs12 class="form-group">
        <code-block :script="headerScript" />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import CodeBlock from "@/components/common/CodeBlock.vue";
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import shortid from "shortid";
import Vue, { VueConstructor } from "vue";
import { ToastInterface } from "~/interface/plugin/toast";
import { ZoneInterface } from "~/interface/data/zone";

const DEFAULT_ITEM = {
  id: null,
  name: "",
  tracking_code: []
};

const DEFAULT_SETTING = {
  tab: 0,
  parent: "body",
  type: "content_locker",
  targetElement: "body",
  intersectionRatio: 30,
  frequency: 30
};

interface ComponentData {
  title: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ZoneInterface;
  key: string;
  $toast: ToastInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethods {
  show(item: ZoneInterface): void;

  hidden(): void;
}

const EventTrackingFormShowDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "EventTrackingFormShowDialog",
  components: {
    CodeBlock,
    FormDialog
  },
  data() {
    return {
      title: "",
      isEdit: false,
      timeout: null,
      loading: false,
      setting: cloneDeep(DEFAULT_SETTING),
      key: shortid.generate(),
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    headerScript() {
      if (this.item.tracking_code && Array.isArray(this.item.tracking_code)) {
        return (
          `https://www.example.com/logs/tracking_action?` +
          this.item.tracking_code.map(item => `${item.name}=${item.name}`).join("&")
        );
      }
      return "https://www.example.com/logs/tracking_action?";
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        this.setting = cloneDeep(DEFAULT_SETTING);
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
        this.setting = cloneDeep(DEFAULT_SETTING);
      }
      this.key = shortid.generate();
      this.title = "Mã theo dõi";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    }
  }
});

export default EventTrackingFormShowDialog;
export type EventTrackingFormShowDialogRef = InstanceType<
  typeof EventTrackingFormShowDialog
>;
</script>
