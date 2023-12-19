<template>
  <form-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Điều chỉnh độ ưu tiên"
    label-button-confirm="Xác nhận"
    @on-submit="confirmItem"
  >
    <template slot="content">
      <v-flex xs12>
        <v-checkbox
          v-model="isWeighted"
          label="Sử dụng trọng số hiển thị"
          class="no-margin"
          hide-details
          dense
        ></v-checkbox>
      </v-flex>

      <v-flex xs12 class="mt-2">
        <v-slider-with-validation
          v-model="item.weight"
          :disabled="!isWeighted"
          :min="-200"
          :max="200"
          :label="'Trọng số'"
          name="weight"
          hint="Số càng lớn tỉ lệ xuất hiện càng cao (Từ -200 đến 200)"
          rules="max_value:200|min_value:-200"
          persistent-hint
        />
      </v-flex>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import VTextAreaWithValidation from "@/components/common/VTextAreaWithValidation";
import { responseErrorToString } from "@/util/array";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import ConfirmDialog from "~/components/common/ConfirmDialog";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { ConfirmDialogRef } from "~/components/common/ConfirmDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import VSliderWithValidation from "~/components/common/VSliderWithValidation.vue";
import FormDialog from "~/components/common/FormDialog.vue";

const DEFAULT_ITEM = {
  id: null,
  name: "",
  weight: null
};

interface ComponentData extends GlobalDataInterface {
  item: BannerMMSInterface | BannerRedirectInterface;
  loading: boolean;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $adsRepository: RepositoryInterface;
}

interface ComponentMethod {
  show(item: BannerMMSInterface | BannerRedirectInterface): void;

  hide(): void;

  confirmItem(): void;
}

const BannerChangeWeightDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerChangeWeightDialog",
  components: {
    FormDialog,
    VSliderWithValidation,
    VTextAreaWithValidation,
    ConfirmDialog
  },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      message: "",
      isWeighted: false
    };
  },
  computed: {

  },
  watch: {
    isWeighted(value) {
      if (!value) {
        this.item.weight = null;
      }
    }
  },
  methods: {
    show(item) {
      this.item = cloneDeep(item);
      if (this.item.weight > 0) {
        this.isWeighted = true;
      } else {
        this.isWeighted = false;
      }
      this.$refs.refConfirmDialog.show();
      this.message = "";
    },
    hide() {
      this.isWeighted = false;
      this.$refs.refConfirmDialog.hidden();
    },

    async confirmItem() {
      this.loading = true;
      try {
        const data = await this.$adsRepository.post("change-weight", {
          id: this.item.id,
          weight: this.item.weight || null
        });
        this.loading = false;
        if (data.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.success("Điều chỉnh trọng số thành công.");
        } else {
          this.$toast.global.server_error_msg(
            responseErrorToString(data.errors)
          );
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refConfirmDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    }
  }
});

export default BannerChangeWeightDialog;
export type BannerChangeWeightDialogRef = InstanceType<
  typeof BannerChangeWeightDialog
>;
</script>
