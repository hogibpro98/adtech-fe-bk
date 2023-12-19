<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm8 md9 lg6 xl4"
    attach-dropdown
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <step-select-type-targeting-banner-sms-vendor
        v-model="item"
        attach-dropdown
        class="min-h-11r"
      />
      <step-import-file-targeting-banner-m-m-s
        v-if="item.targeting_type === 'import_file'"
        v-model="item"
        attach-dropdown
        class="min-h-11r"
      />
      <v-flex xs12>
        <step-targeting-banner-sms
          v-if="item.targeting_type === 'targeting'"
          v-model="item"
          :loading="loading"
          attach-dropdown
          class="min-h-11r"
        />
      </v-flex>
      <!--      <step-targeting-advance-banner-->
      <!--        v-if="item.targeting_type === 'targeting'"-->
      <!--        v-model="item"-->
      <!--        attach-dropdown-->
      <!--        :loading="loading"-->
      <!--        class="min-h-11r"-->
      <!--      />-->
      <phone-group-select
        v-if="item.targeting_type === 'phone_group'"
        v-model="item.phone_group"
        :loading="loading"
        class="w-full"
      />
      <div v-if="item.phone_group && item.phone_group.numbers">
        <div>Danh sách số điện thoại:</div>
        <v-list flat dense expand max-height="400">
          <v-list-item
            v-for="(value, index) in item.phone_group.numbers"
            :key="index"
          >
            {{ value }}
          </v-list-item>
        </v-list>
      </div>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import FormDialog, { FormDialogRef } from "~/components/common/FormDialog.vue";
import StepImportFileTargetingBannerMMS from "~/components/page/manage-campaign/banner/steps/StepImportFileTargetingBannerMMS.vue";
import StepSelectTypeTargetingBannerMMS from "~/components/page/manage-campaign/banner/steps/StepSelectTypeTargetingBannerMMS.vue";
import StepSelectTypeTargetingBannerSmsVendor from "~/components/page/manage-campaign/banner/steps/StepSelectTypeTargetingBannerSmsVendor.vue";
import StepTargetingAdvanceBanner from "~/components/page/manage-campaign/banner/steps/StepTargetingAdvanceBanner.vue";
import StepTargetingOptionalBanner from "~/components/page/manage-campaign/banner/steps/StepTargetingOptionalBanner.vue";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { GlobalDataInterface } from "~/interface/data/global";
import PhoneGroupSelect from "~/components/select/PhoneGroupSelect.vue";
import StepTargetingBannerMMS from "~/components/page/manage-campaign/banner/steps/StepTargetingBannerMMS.vue";
import StepTargetingBannerSms from "~/components/page/manage-ads/sms/index/step/StepTargetingBannerSms.vue";

const DEFAULT_ITEM = {};

interface ComponentData extends GlobalDataInterface {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  item: BannerMMSInterface | BannerRedirectInterface;
  timeout: number;
  loading: boolean;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethod {
  show(item: BannerMMSInterface | BannerRedirectInterface): void;

  hidden(): void;

  onSubmit(): void;
}

const BannerTelcoEditTypeTargetingDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerTelcoEditTypeTargetingDialog",
  components: {
    StepTargetingBannerSms,
    PhoneGroupSelect,
    StepImportFileTargetingBannerMMS,
    StepSelectTypeTargetingBannerMMS,
    StepSelectTypeTargetingBannerSmsVendor,
    FormDialog
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      item: {},
      timeout: null,
      loading: false
    };
  },
  computed: {
    targetingType() {
      return this.item.targeting_type;
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
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `${
        this.isEdit ? "Cập nhật" : "Thêm"
      } đối tượng mục tiêu cho quảng cáo`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    onSubmit() {
      this.$emit("submit", this.item, this.hidden);
    }
  }
});

export default BannerTelcoEditTypeTargetingDialog;
export type BannerTelcoEditTypeTargetingDialogRef = InstanceType<
  typeof BannerTelcoEditTypeTargetingDialog
>;
</script>
