<template>
  <div>
    <v-row class="list-preview-ads">
      <v-flex
        v-for="item in items"
        :key="item.id"
        sm12
        md3
        lg3
        class="form-group ads-item"
      >
        <ads-preview-item
          :data="item"
          @approve="openDialogApprove(item)"
          @reject="openDialogReject(item)"
        ></ads-preview-item>
      </v-flex>
      <v-overlay absolute color="#fff" :value="loading">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-overlay>
    </v-row>
    <div>
      <v-flex v-if="total > 0" sm12>
        <v-pagination
          v-model="page"
          :length="totalPage"
          :total-visible="7"
        ></v-pagination>
      </v-flex>
    </div>
    <approve-ads-preview-dialog
      ref="refApproveDialog"
      @action-success="fetchAdsPreview()"
    ></approve-ads-preview-dialog>
    <reject-ads-preview-dialog
      ref="refRejectDialog"
      @action-success="fetchAdsPreview()"
    ></reject-ads-preview-dialog>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import AdsPreviewItem from "~/components/page/ads-preview/AdsPreviewItem.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";
import ApproveAdsPreviewDialog, {
  ApproveAdsPreviewDialogRef
} from "~/components/page/ads-preview/ApproveAdsPreviewDialog.vue";
import RejectAdsPreviewDialog, {
  RejectAdsPreviewDialogRef
} from "~/components/page/ads-preview/RejectAdsPreviewDialog.vue";

interface ComponentData {
  loading: boolean;
  status: string;
  $adsReviewRepository: RepositoryInterface;
  $refs: {
    refRejectDialog: RejectAdsPreviewDialogRef;
    refApproveDialog: ApproveAdsPreviewDialogRef;
  };
  $toast: ToastInterface;
}

interface ComponentMethods {
  openDialogReject: Function;
  openDialogApprove: Function;
  fetchAdsPreview: Function;
}

/**
 * @property {Object} $adsReviewRepository
 */

let index = 1;

const ListAdsPreview = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ListAdsPreview",
  components: {
    RejectAdsPreviewDialog,
    ApproveAdsPreviewDialog,
    AdsPreviewItem
  },
  props: {
    status: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      loading: false,
      items: [],
      page: 1,
      total: 0
    };
  },
  computed: {
    totalPage() {
      return Math.ceil((this.total || 0) / 8);
    }
  },
  watch: {
    page(val) {
      this.fetchAdsPreview(val);
    }
  },
  created() {
    this.fetchAdsPreview();
  },
  methods: {
    openDialogReject(item) {
      this.$refs.refRejectDialog.show(item);
    },
    openDialogApprove(item) {
      this.$refs.refApproveDialog.show(item);
    },
    async fetchAdsPreview(pageFetch = this.page) {
      this.loading = true;
      index = index + 1;
      const indexFetch = index;
      try {
        const res = await this.$adsReviewRepository.list({
          page: pageFetch,
          itemsPerPage: 8,
          custom_status: this.status !== "review" ? this.status : undefined
        });
        if (indexFetch === index) {
          this.loading = false;
          if (res.code === CODE_SUCCESS) {
            this.items = res.data;
            this.total = res.total;
          } else {
            this.$toast.global.action_fail();
          }
        }
      } catch (e) {
        this.loading = false;
        this.$toast.global.action_fail();
      }
    }
  }
});

export default ListAdsPreview;
export type ListAdsPreviewRef = InstanceType<typeof ListAdsPreview>;
</script>
<style lang="scss" scoped>
.list-preview-ads {
  position: relative;
  margin: 16px;

  .ads-item {
    padding: 8px;
  }
}
</style>
