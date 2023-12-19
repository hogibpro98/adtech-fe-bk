<template>
  <v-card class="ads-preview-item" elevation="2">
    <div class="target-url">
      <a :href="adsInformation.url" target="_blank" download>{{
        targetURLShow
      }}</a>
    </div>
    <div>
      <layout-preview :data="dataVertical" :data-sample="dataSampleVertical" />
    </div>
    <div class="d-flex justify-content-space-between mt-auto">
      <div>
        <v-tooltip v-if="previewStatus === undefined || previewStatus === 'reject'" offset-overflow right>
          <template #activator="{ on, attrs }">
            <span v-on="on">
              <v-btn icon color="success" @click="approveAds()">
                <v-icon>check</v-icon>
              </v-btn>
            </span>
          </template>
          <span>Chọn quảng cáo này</span>
        </v-tooltip>
        <v-tooltip v-if="previewStatus === undefined || previewStatus === 'reviewed'" offset-overflow right>
          <template #activator="{ on, attrs }">
            <span v-on="on">
              <v-btn icon color="error" @click="rejectAds()">
                <v-icon>close</v-icon>
              </v-btn>
            </span>
          </template>
          <span>Chặn quảng cáo này</span>
        </v-tooltip>
      </div>
      <v-btn small text @click="goToAds()">
        Truy cập quảng cáo
      </v-btn>
    </div>
  </v-card>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { truncate } from "lodash";
import LayoutPreview from "~/components/page/manage-layout/layout-preview/index.vue";

interface ComponentData {}

interface ComponentMethods {}

/**
 * @property {Object} $blockUrlRepository
 */

const AdsPreviewItem = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "AdsPreviewItem",
  components: { LayoutPreview },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {
    adsInformation() {
      return this.data?.metadata_redirects || {};
    },
    previewStatus() {
      return this.data?.users?.[0]?.pivot?.status;
    },
    targetURLShow() {
      return truncate(this.adsInformation?.url, {
        length: 28,
        separator: " "
      });
    },
    dataVertical() {
      return {
        name: "",
        layout_type: "layout_img_above",
        style_component: {
          "background-color": "#FFFFFFFF",
          "border-color": "#00000000"
        },
        style_image: {
          float: "left",
          aspect_ratio: "1.91:1"
        },
        style_title: {
          "font-family": "Roboto",
          "font-size": "14px",
          "text-align": "left",
          "font-style": "normal",
          "font-weight": "auto",
          color: "#000"
        },
        style_description: {
          "font-family": "Roboto",
          "font-size": "14px",
          "text-align": "left",
          "font-style": "normal",
          "font-weight": "auto",
          color: "#000"
        }
      };
    },
    dataHorizontal() {
      return {
        name: "",
        layout_type: "layout_img_side",
        style_component: {
          "background-color": "#FFFFFFFF",
          "border-color": "#00000000"
        },
        style_image: {
          float: "left",
          aspect_ratio: "1:1"
        },
        style_title: {
          "font-family": "Roboto",
          "font-size": "14px",
          "text-align": "left",
          "font-style": "normal",
          "font-weight": "auto",
          color: "#000"
        },
        style_description: {
          "font-family": "Roboto",
          "font-size": "14px",
          "text-align": "left",
          "font-style": "normal",
          "font-weight": "auto",
          color: "#000"
        }
      };
    },
    dataSampleVertical() {
      const square = (this.adsInformation?.media || []).find(
        data => data.type === "square"
      );
      return {
        title: this.adsInformation?.title || "Tiêu đề quảng cáo",
        description: this.adsInformation?.description || "Mô tả quảng cáo",
        media: square?.data,
        thumbnail: square?.thumbnail
      };
    }
  },
  methods: {
    goToAds() {
      window.open(this.adsInformation?.url, "_blank");
    },
    approveAds() {
      this.$emit("approve");
    },
    rejectAds() {
      this.$emit("reject");
    }
  }
});

export default AdsPreviewItem;
export type AdsPreviewItemRef = InstanceType<typeof AdsPreviewItem>;
</script>
<style lang="scss" scoped>
.ads-preview-item {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  .target-url {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 13px;
    height: 32px;
  }

  .approve-ads-btn {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
