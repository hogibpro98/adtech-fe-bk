<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.name"
          :loading="loading"
          name="name"
          type="text"
          label="Tên"
          required
          counter="100"
          rules="required|max:100"
        />
      </v-flex>
      <v-flex xs12 md6 class="form-group pr-2">
        <v-number-field-with-validation
          v-model="item.width"
          :loading="loading"
          min-value-fixed
          min-value="0"
          name="width"
          label="Chiều dọc"
          suffix="px"
          required
          rules="min_value:0|max_value:10000|required"
        />
      </v-flex>
      <v-flex xs12 md6 class="form-group pl-2">
        <v-number-field-with-validation
          v-model="item.height"
          :loading="loading"
          name="height"
          min-value-fixed
          min-value="0"
          label="Chiều ngang"
          suffix="px"
          required
          rules="min_value:0|max_value:10000|required"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-area-with-validation
          v-model="item.description"
          :loading="loading"
          name="description"
          label="Mô tả"
          counter="500"
          rules="max:500"
          rows="3"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <channel-select
          key="channel"
          v-model="item.channel"
          :loading="loading"
          name="channel_id"
          required
          rules="required"
          item-text="name"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <layout-select
          key="layout"
          v-model="item.layout"
          :loading="loading"
          name="layout_id"
          item-text="name"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-select-with-validation
          key="display_type"
          v-model="item.display_type"
          :items="displayTypes"
          :loading="loading"
          label="Kiểu hiển thị"
          required
          rules="required"
          name="display_type"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <position-input
          v-if="item.display_type === 'sticky'"
          key="position"
          v-model="item.position"
          name="position"
          :loading="loading"
        />
        <row-column-input
          v-else-if="item.display_type === 'native'"
          key="native"
          v-model="item.size"
          name="native"
          :loading="loading"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <constract-select
          v-model="item.constract"
          :query-params="contractParams"
          name="constract_id"
          label="Gói mua khoán"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import ChannelSelect from "@/components/select/ChannelSelect.vue";
import cloneDeep from "lodash/cloneDeep";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { ToastInterface } from "~/interface/plugin/toast";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ZoneInterface } from "~/interface/data/zone";
import LayoutSelect from "~/components/select/LayoutSelect.vue";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import {
  DISPLAY_TYPE_SELECT,
  DISPLAY_TYPES,
  POSITION_STICKY_TYPES
} from "~/constants/dataSelect";
import PositionInput from "~/components/page/setting-display-ads/zone/PositionInput.vue";
import RowColumnInput from "~/components/page/setting-display-ads/zone/RowColumnInput.vue";
import ConstractSelect from "~/components/select/ConstractSelect.vue";

const DEFAULT_ITEM = {
  ads_type_id: null,
  channel_id: null,
  description: "",
  id: null,
  slot: null,
  name: "",
  script: "",
  width: null,
  height: null,
  size: {
    large: {
      row: 1,
      column: 5
    },
    small: {
      row: 1,
      column: 3
    }
  },
  display_type: "banner",
  user: {},
  constract: {},
  constract_id: null
};

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: ZoneInterface;
  $toast: ToastInterface;
  $refs: {
    refFormDialog: FormDialogRef;
  };
  $zoneRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ZoneInterface): void;

  hidden(): void;

  onSubmit(): void;

  convertDataToUpdate(item: ZoneInterface): object;

  addItem(): void;

  editItem(): void;
}

const ZoneFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ZoneFormDialog",
  components: {
    RowColumnInput,
    PositionInput,
    VSelectWithValidation,
    LayoutSelect,
    VNumberFieldWithValidation,
    ChannelSelect,
    FormDialog,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    ConstractSelect
  },
  props: {
    attachDropdown: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    displayTypes() {
      return DISPLAY_TYPE_SELECT;
    },
    channel() {
      return this.item.channel || {};
    },
    contractParams() {
      const params = {
        select_status: "approve"
      };
      if (this.channel) {
        if (this.channel.user_id) {
          params.resource_user_id = this.channel.user_id;
        }
      }
      return params;
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

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} khu vực hiển thị`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },
    convertDataToUpdate(item) {
      const dataUpdate = {
        id: item?.id,
        name: item?.name,
        description: item?.description,
        display_type: item?.display_type,
        height: item?.height,
        width: item?.width,
        channel_id: item?.channel?.id,
        ads_type_id: item?.ads_type?.id,
        layout_id: item?.layout?.id,
        size: undefined,
        position: undefined,
        constract_id: item?.constract?.id
      };
      if (dataUpdate.display_type === DISPLAY_TYPES.NATIVE) {
        dataUpdate.size = item.size;
      } else if (dataUpdate.display_type === DISPLAY_TYPES.STICKY) {
        if (item?.position?.type === POSITION_STICKY_TYPES.FIXED) {
          dataUpdate.position = {
            type: POSITION_STICKY_TYPES.FIXED,
            top: item?.position?.top,
            right: item?.position?.right,
            bottom: item?.position?.bottom,
            left: item?.position?.left
          };
        } else if (item?.position?.type === POSITION_STICKY_TYPES.ABSOLUTE) {
          dataUpdate.position = {
            type: POSITION_STICKY_TYPES.ABSOLUTE,
            position_absolute: item?.position?.position_absolute
          };
        }
      }

      return dataUpdate;
    },
    async addItem() {
      this.loading = true;
      try {
        const res = await this.$zoneRepository.create(
          this.convertDataToUpdate(this.item)
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("khu vực hiển thị");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    },

    async editItem() {
      this.loading = true;

      try {
        const res = await this.$zoneRepository.update(
          this.convertDataToUpdate(this.item)
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("khu vực hiển thị");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    }
  }
});

export default ZoneFormDialog;
export type ZoneFormDialogRef = InstanceType<typeof ZoneFormDialog>;
</script>
