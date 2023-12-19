<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    content-class="flex xs12 md10 xl6"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline">Phê duyệt template SMS</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row
            id="step-information-banner-mms"
            class="no-margin w-full justify-content-center"
          >
            <v-flex sm6 class="form-group pr-3 mt-4">
              <v-list-item dense>
                Người sở hữu: &nbsp;
                <strong> {{ item.user && item.user.full_name }}</strong>
              </v-list-item>
              <v-list-item dense>
                Tên template: &nbsp;<strong> {{ item.name }}</strong>
              </v-list-item>
              <v-list-item dense>
                Lĩnh vực hoạt động: &nbsp;<strong> {{ item.cat_id }}</strong>
              </v-list-item>
              <v-list-item dense>
                Nội dung: &nbsp;<strong> {{ item.content }}</strong>
              </v-list-item>
            </v-flex>
            <v-flex sm6 class="form-group ">
              <preview-banner-m-m-s
                readonly
                :display-size="displaySize"
                :loading="loading"
                :header="item.content"
                :media-type="item.media_type"
              />
            </v-flex>
          </v-row>
          <v-layout justify-end class="mt-0  z-10 background px-8 py-2">
            <v-btn color="grey" text @click.native="showing = false">
              Hủy
            </v-btn>
            <v-btn
              v-if="canReject"
              :loading="loading"
              color="error darken-1"
              class="mr-0"
              text
              @click.native="reject"
            >
              Từ chối
            </v-btn>
            <v-btn
              v-if="canApprove"
              :loading="loading"
              color="primary darken-1"
              class="mr-0"
              text
              @click.native="approve"
            >
              Phê duyệt
            </v-btn>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import RoleSelect from "@/components/select/RoleSelect.vue";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogInterface } from "~/interface/components/dialog";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { RolesInterface } from "~/interface/data/permission";
import ContentMMSWithValidation from "~/components/page/manage-campaign/banner/common/ContentMMSWithValidation.vue";
import PreviewBannerMMS from "~/components/page/manage-campaign/banner/common/PreviewBannerMMS.vue";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";

const DEFAULT_ITEM = {
  id: null,
  name: "",
  user: null,
  user_id: null,
  cat_id: null,
  content: null,
  header: ""
};

interface ItemInterface {
  ip: string;
  role: RolesInterface;
  role_id: string;
}

interface ComponentData {
  $templateSmsRepository: RepositoryInterface;
  $refs: {
    form: FormDialogInterface;
  };
  showing: boolean;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ItemInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;

  onSubmit(): void;

  editItem(): void;

  addItem(): void;

  resetData(): void;
}

const TelcoTemplateReviewDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TelcoTemplateReviewDialog",
  components: {
    AgencyAdvertiserSelect,
    BusinessActivitySelect,
    PreviewBannerMMS,
    VTextFieldWithValidation
  },
  data() {
    return {
      showing: false,
      canApprove: false,
      canReject: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      displaySize: {
        width: 300,
        height: 200,
        image_src: null
      }
    };
  },
  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item) {
      const template = cloneDeep(item);
      template.header = template.mms_header;
      this.item = template;
      this.canApprove = true;
      this.showing = true;
    },
    showApprove(item) {
      if (item) {
        this.canApprove = true;
        this.show(item);
      }
    },

    showReject(item) {
      if (item) {
        this.canReject = true;
        this.show(item);
      }
    },

    showReview(item) {
      if (item) {
        this.canApprove = true;
        this.canReject = true;
        this.show(item);
      }
    },

    async approve() {
      this.loading = true;
      try {
        const res = await this.$templateSmsRepository.post("approve", {
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("success");
          this.$toast.global.action_success("phê duyệt template SMS");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    },

    async reject() {
      this.loading = true;
      try {
        const res = await this.$templateSmsRepository.post("reject", {
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("success");
          this.$toast.global.action_success("từ chối phê duyệt template SMS");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;

        this.$toast.global.action_fail();
      }
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.item = cloneDeep(DEFAULT_ITEM);
        this.canApprove = false;
        this.canReject = false;
        this.$refs.form.reset();
      }, 300);
    }
  }
});

export default TelcoTemplateReviewDialog;
export type TelcoTemplateReviewDialogRef = InstanceType<
  typeof TelcoTemplateReviewDialog
>;
</script>
