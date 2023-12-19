<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    content-class="flex xs12 sm8 md8 lg5 xl4"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.name"
          :loading="loading"
          :counter="100"
          name="name"
          type="text"
          label="Tên"
          required
          rules="required|max:100"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.code"
          :loading="loading"
          :counter="100"
          name="code"
          type="text"
          label="Code"
          required
          rules="required|max:100"
        />
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-select-with-validation
          v-model="item.level"
          :items="levels"
          :loading="loading"
          name="level"
          type="text"
          label="Cấp"
          required
          rules="required"
        />
      </v-flex>
      <v-flex v-if="item.level !== '0'" xs12 class="form-group">
        <location-select
          :key="`parent-level-${item.level}`"
          v-model="item.parent"
          :items="regions"
          :loading="loading"
          :query-params="{
            select_level: item.level - 1
          }"
          :attach="false"
          item-value="id"
          name="parent_id"
          type="text"
          label="Trực thuộc"
          required
          rules="required"
        />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import VSelectWithValidation from "@/components/common/VSelectWithValidation.vue";
import LocationSelect from "@/components/select/LocationSelect.vue";
import { LEVEL_LOCATIONS } from "@/constants/dataSelect";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { FormDialogRef } from "../../common/FormDialog.vue";
import { LocationInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: LocationInterface;
  $refs: { refFormDialog: FormDialogRef };
  $targetingLocationRepository: RepositoryInterface;
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
  code: "",
  created_at: null,
  id: null,
  level: "",
  item_permissions: [],
  name: "",
  parent: null,
  parent_id: null,
  user: null,
  user_id: null
};

/**
 * @property {Object} $targetingLocationRepository
 */

const TargetingLocationFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TargetingLocationFormDialog",
  components: {
    LocationSelect,
    VSelectWithValidation,
    FormDialog,
    VTextFieldWithValidation
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      levels: LEVEL_LOCATIONS,
      regions: []
    };
  },
  computed: {
    level() {
      return parseInt(this.item?.level, 10);
    }
  },
  watch: {
    level(val) {
      if (
        val === null ||
        val === undefined ||
        (this.item.parent && parseInt(this.item.parent?.level, 10) !== val - 1)
      ) {
        this.item.parent = null;
      }
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

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} vị trí`;
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
        const res = await this.$targetingLocationRepository.create({
          ...this.item,
          parent_id: this.item?.parent?.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("vị trí");
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
        const res = await this.$targetingLocationRepository.update({
          ...this.item,
          parent_id: this.item?.parent?.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("vị trí");
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

export default TargetingLocationFormDialog;
export type TargetingLocationFormDialogRef = InstanceType<
  typeof TargetingLocationFormDialog
>;
</script>
