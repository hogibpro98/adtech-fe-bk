<template>
  <v-flex xs12>
    <v-row class="no-margin">
      <v-list-item-content class="no-padding">
        <div class="max-width-35">
          <preview-banner-m-m-s
            :display-size="displaySize"
            :loading="loading"
            :header="innerValue.content"
            :banner-name="bannerName"
            class="mt-4"
          />
        </div>
      </v-list-item-content>
    </v-row>
    <banner-m-m-s-edit-information-dialog
      ref="refEditBannerInformationDialog"
      @submit="onSaveData"
    />
  </v-flex>
</template>
<script lang="ts">
import PreviewBannerMMS, {
  PreviewBannerMMSRef
} from "~/components/page/manage-campaign/banner/common/PreviewBannerMMS.vue";
import BannerMMSEditInformationDialog from "~/components/page/manage-campaign/banner/dialog-edit-step/BannerMMSEditInformationDialog.vue";
import wrapper from "~/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { BannerMMSInterface } from "~/interface/data/banner";

interface ComponentData {
  refs: {
    refEditBannerInformationDialog: PreviewBannerMMSRef;
  };
  innerValue: BannerMMSInterface;
}

interface ComponentMethod {
  openDialogEditInformationBanner(): void;
  onSaveData(item: BannerMMSInterface, cb: Function): void;
}

const PreviewContentBannerSms = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "PreviewContentBannerSms",
  components: {
    BannerMMSEditInformationDialog,
    PreviewBannerMMS
  },
  mixins: [wrapper],
  props: {
    displaySize: {
      type: Object,
      default: () => ({
        width: 300,
        height: 200,
        image_src: null
      })
    },
    loading: {
      type: Boolean,
      default: false
    },
    mediaData: {
      type: Array,
      default: null
    },
    readonly: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      innerValue: {}
    };
  },
  computed: {
    bannerName() {
      return this.innerValue?.brandname?.name;
    },
    width() {
      return this.displaySize.width || 300;
    },
    height() {
      return this.displaySize.height || 200;
    },
    scale() {
      return Math.floor((this.height * 100) / this.width);
    },
    url() {
      return this.displaySize.image_src;
    },
    mediaIsExists() {
      return (
        this.mediaData && this.mediaData.length > 0 && this.mediaData[0].data
      );
    },
    dataSingle() {
      return (this.mediaData && this.mediaData[0]) || {};
    },
    timeSendMMS() {
      return `Từ ${this.innerValue.start_hour} đến ${this.innerValue.end_hour}`;
    },
    brandname() {
      return (
        (this.innerValue.brandname && this.innerValue.brandname.name) || ""
      );
    }
  },
  methods: {
    openDialogEditInformationBanner() {
      this.$refs.refEditBannerInformationDialog.show(this.innerValue);
    },
    onSaveData(item, cb) {
      this.innerValue = item;
      if (cb) {
        cb();
      }
    }
  }
});

export default PreviewContentBannerTelco;
export type PreviewContentBannerSmsRef = InstanceType<
  typeof PreviewContentBannerTelco
>;
</script>
