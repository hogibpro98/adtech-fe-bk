<template>
  <v-dialog
    v-model="showing"
    width="360px"
    style="overflow: hidden"
    :scrollable="false"
    content-class="no-box-shadow p-relative overflow-hidden"
  >
    <preview-banner-m-m-s
      :display-size="displaySize"
      :header="item.mms_header"
      :media-data="item.message"
    />
    <v-btn
      small
      icon
      dark
      class="button-close-preview"
      @click="showing = false"
    >
      <v-icon> mdi-close</v-icon>
    </v-btn>
  </v-dialog>
</template>
<script lang="ts">
import PreviewBannerMMS from "@/components/page/manage-campaign/banner/common/PreviewBannerMMS";
import Vue, { VueConstructor } from "vue";
import { BannerMMSInterface } from "~/interface/data/banner";

interface ComponentData {
  showing: boolean;
  item: {
    message: Array<object>;
    mms_header: string;
  };
}

interface ComponentMethod {
  show(item: BannerMMSInterface): boolean;
  hide(): void;
}

const PreviewBannerMmsDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "PreviewBannerMmsDialog",
  components: { PreviewBannerMMS },
  data() {
    return {
      showing: false,
      item: {
        message: null,
        mms_header: null
      }
    };
  },
  computed: {
    displaySize() {
      return {
        width: 300,
        height: 200
      };
    }
  },
  methods: {
    show(item) {
      this.item = item;
      this.showing = true;
    },
    hide() {
      this.item = {
        message: null,
        mms_header: null
      };
      this.showing = false;
    }
  }
});

export default PreviewBannerMmsDialog;
export type PreviewBannerMmsDialogRef = InstanceType<
  typeof PreviewBannerMmsDialog
>;
</script>

<style>
.button-close-preview {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
