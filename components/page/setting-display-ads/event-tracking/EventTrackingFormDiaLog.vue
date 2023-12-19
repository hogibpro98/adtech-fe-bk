<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm8 md8 lg5 xl4"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.name"
          :loading="loading"
          counter="255"
          name="name"
          type="text"
          label="Tên"
          required
          rules="required|max:255"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <action-category-select
          v-model="item.action_category_id"
          :loading="loading"
          :return-object="false"
          name="action_category_id"
          label="Danh mục"
          item-value="id"
          required
          rules="required"
        />
      </v-flex>
      <v-flex v-if="item.action_category_id == 1" xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.custom_category"
          :loading="loading"
          counter="255"
          name="custom_category"
          type="text"
          label="Danh mục chỉnh sửa"
          required
          rules="required|max:255"
        />
      </v-flex>
<!--      <v-flex sm12 class="form-group">-->
<!--        <v-number-field-with-validation-->
<!--          v-model="item.value"-->
<!--          :loading="loading"-->
<!--          :suffix="item.value ? '₫' : ''"-->
<!--          :decimal="true"-->
<!--          name="value"-->
<!--          label="Giá trị"-->
<!--          rules="min:0|max:14"-->
<!--        />-->
<!--      </v-flex>-->
      <v-flex xs12 class="form-group">
        <v-select-with-validation
          v-model="item.counting_type"
          :loading="loading"
          name="counting_type"
          label="Cách đếm"
          :items="selectCountType"
          :disabled="isEdit"
        />
      </v-flex>
      <v-flex v-if="item.counting_type == 3" xs12 class="form-group">
        <v-row>
          <v-col cols="4">
            <v-number-field-with-validation
              v-model="item.counting_data.count"
              :loading="loading"
              :decimal="false"
              name="count"
              label="Số lượt"
              required
              rules="numeric|min_value:1|max:99999999999999|required"
            />
          </v-col>
          <v-col cols="4">
            <v-number-field-with-validation
              v-model="item.counting_data.duplication"
              :loading="loading"
              :decimal="false"
              name="duplication"
              label="Trong khoảng"
              required
              rules="numeric|min_value:1|max:99999999999999|required"
            />
          </v-col>
          <v-col cols="4">
            <v-select-with-validation
              v-model="item.counting_data.minute"
              :loading="loading"
              name="minute"
              label="Thời gian"
              :items="selectableTime"
              required
              rules="required"
            />
          </v-col>
        </v-row>
      </v-flex>
      <v-flex xs12 class="form-group">
        <event-tracking-code-check-box
          v-model="item.tracking_code"
          name="tracking_code"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { TagInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import MacroCheckbox from "~/components/common/MacroCheckbox.vue";
import ActionCategorySelect from "~/components/select/ActionCategorySelect.vue";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import {
  EVEN_TRACKING_COUNT_TYPE,
  EVEN_TRACKING_TIME
} from "~/constants/dataSelect";
import EventTrackingCodeCheckBox from "~/components/common/EventTrackingCodeCheckBox.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: TagInterface;
  $refs: { refFormDialog: FormDialogRef };
  $eventTrackingFormDiaLog: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hidden: Function;
  editItem: Function;
  addItem: Function;
  onSubmit: Function;
}

const DEFAULT_ITEM = {
  id: null,
  name: "",
  custom_category: "",
  counting_type: "1",
  counting_data: {
    count: 1,
    minute: "hour",
    duplication: 1
  },
  value: 1,
  tracking_code: null,
  action_category_id: null,
  user_id: null
};

/**
 * @property {Object} actionCategoryRepository
 */

const EventTrackingFormDiaLog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "EventTrackingFormDiaLog",
  components: {
    VSelectWithValidation,
    FormDialog,
    VTextFieldWithValidation,
    VNumberFieldWithValidation,
    ActionCategorySelect,
    EventTrackingCodeCheckBox
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      selectableTime: cloneDeep(EVEN_TRACKING_TIME),
      selectCountType: cloneDeep(EVEN_TRACKING_COUNT_TYPE)
    };
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

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} event tracking`;
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

    async addItem() {
      this.loading = true;
      try {
        this.mapData();
        const res = await this.$eventTrackingFormDiaLog.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("event tracking");
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
        this.mapData();
        const res = await this.$eventTrackingFormDiaLog.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("event tracking");
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

    mapData() {
      if (this.item.parent) {
        this.item.parent_id = this.item.parent.id;
      }
    }
  }
});

export default EventTrackingFormDiaLog;
export type EventTrackingFormDiaLogRef = InstanceType<
  typeof EventTrackingFormDiaLog
>;
</script>
