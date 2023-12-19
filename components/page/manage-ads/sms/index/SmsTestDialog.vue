<template>
  <form-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Gửi thử tin nhắn SMS"
    label-button-confirm="Xác nhận"
    @hidden="phone = null"
    @on-submit="confirmItem"
  >
    <template slot="content">
      <v-flex xs12>
        <v-text-field-with-validation
          v-model="phone"
          :loading="loading"
          name="phone"
          label="Số điện thoại"
          required
          hint="Nhập số điện thoại muốn gửi đến."
          rules="required|phone"
        />
      </v-flex>
      <div v-if="adsParams.length > 0" class="my-2">
        Tham số tin nhắn động :
      </div>
      <v-flex v-for="(item, index) in adsParams" :key="`params-${index}`" xs12>
        <v-text-field-with-validation
          v-model="params[item]"
          :loading="loading"
          :name="`params-${params[item]}`"
          :label="item"
          required
          rules="required|max:50"
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
import FormDialog from "~/components/common/FormDialog.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";

const DEFAULT_ITEM = {
  id: null
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

const SmsTestDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "SmsTestDialog",
  components: {
    VTextFieldWithValidation,
    FormDialog
  },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      phone: "",
      message: "",
      params: {}
    };
  },
  computed: {
    adsParams() {
      return this.item.params || [];
    }
  },
  methods: {
    show(item) {
      this.item = item;
      this.$refs.refConfirmDialog.show();
      this.message = "";
    },
    hide() {
      this.item = cloneDeep(DEFAULT_ITEM);
      this.params = {};
      this.$refs.refConfirmDialog.hidden();
    },

    async confirmItem() {
      this.loading = true;
      try {
        const res = await this.$adsSmsRepository.post("test-message", {
          ads_id: this.item.id,
          phone: this.phone,
          params: this.params
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("gửi tin nhắn thử thành công");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refConfirmDialog.setErrors(e.response.data.errors);
        }
      }
    }
  }
});

export default SmsTestDialog;
export type SmsTestDialogRef = InstanceType<typeof SmsTestDialog>;
</script>
