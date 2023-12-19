<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    min-width="700"
    max-width="900"
    v-on="$listeners"
  >
    <validation-observer ref="form" v-slot="{ handleSubmit }">
      <form @submit.prevent="handleSubmit(onSubmit)">
        <v-card min-height="450">
          <v-card-title>
            <span class="headline px-3 pt-3"
              >{{ isEdit ? "Cập nhật" : "Thêm" }} gói cước</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row no-gutters>
                <v-flex xs12>
                  <v-text-field-with-validation
                    v-model="item.code"
                    :loading="loading"
                    name="code"
                    type="text"
                    label="Mã gói cước"
                    required
                    rules="required|max:30"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-number-field-with-validation
                    v-model="item.duration"
                    :loading="loading"
                    name="duration"
                    label="Thời gian sử dụng"
                    suffix="ngày"
                    required
                    min-value="0"
                    min-value-fixed
                    rules="required|max_value:100000"
                  />
                </v-flex>
                <v-col cols="12">
                  <v-layout justify-space-between align-center>
                    <v-card-title class="px-0 py-1">
                      Đơn giá
                    </v-card-title>
                  </v-layout>
                </v-col>
                <template >
                  <v-col class="pr-2" cols="6">
                    <v-number-field-with-validation
                      v-model="item.capacity"
                      name="capacity"
                      :loading="loading"
                      label="Dung lượng"
                      min-value="0"
                      min-value-fixed
                      required
                      rules="min:0|required|max_value:999999999"
                      suffix="MB"
                    />
                  </v-col>
                  <v-col class="pl-2" cols="6">
                    <v-number-field-with-validation
                      v-model="item.price"
                      name="price"
                      :loading="loading"
                      label="Giá"
                      min-value-fixed
                      :min-value="0"
                      required
                      rules="min:0|required|max_value:999999999"
                      suffix="₫"
                    />
                  </v-col>
                </template>
                <v-flex xs12>
                  <v-checkbox
                    v-model="item.is_daily"
                    :label="'Gửi hàng ngày'"
                    class="ma-0 pa-0 pt-2"
                    :true-value="1"
                    :false-value="0"
                  >
                  </v-checkbox>
                </v-flex>
              </v-row>
            </v-container>
          </v-card-text>
          <v-layout justify-end class="mt-6 pa-6">
            <v-btn color="grey" text @click.native="showing = false"
              >Hủy
            </v-btn>
            <v-btn
              :loading="loading"
              color="primary darken-1"
              class="mr-0"
              text
              type="submit"
            >
              {{ isEdit ? "Cập nhật" : "Thêm" }}
            </v-btn>
          </v-layout>
        </v-card>
      </form>
    </validation-observer>
  </v-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { FormDialogInterface } from "~/interface/components/dialog";
import { RepositoryInterface } from "~/interface/plugin/repository";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { UserInterface } from "~/interface/data/user";
import { responseErrorToString } from "~/util/array";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";

interface ItemInterface {
  duration: number;
  code: string;
  data: [
    {
      capacity: number;
      price: number;
    }
  ];
}

const DEFAULT_ITEM = {
  id: null,
  duration: null,
  code: null,
  capacity: null,
  price: null,
  is_daily: 0
};

interface ComponentData {
  $dataPackageRepository: RepositoryInterface;
  $refs: {
    form: FormDialogInterface;
  };
  showing: boolean;
  loading: boolean;
  timeout: number;
  item: Array<any>;
  agency: UserInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  addItem(): void;
  resetData(): void;
}

const DataPackageFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "DataPackageFormDialog",
  components: {
    VTextFieldWithValidation,
    VNumberFieldWithValidation
  },
  data() {
    return {
      showing: false,
      loading: false,
      timeout: null,
      isEdit: false,
      item: cloneDeep(DEFAULT_ITEM)
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
    show(item = null) {
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
      }
      this.showing = true;
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
        const res = await this.$dataPackageRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("create-success");
          this.$toast.global.add_success("gói cước");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
        }
      }
    },

    async editItem() {
      this.loading = true;
      if (this.item.is_daily) {
        this.item.is_daily = 1;
      } else {
        this.item.is_daily = 0;
      }
      try {
        const res = await this.$dataPackageRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("edit-success");
          this.$toast.global.edit_success("gói cước");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
        }
      }
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.item = cloneDeep(DEFAULT_ITEM);
        this.isEdit = false;
        this.$refs.form.reset();
      }, 300);
    },

    addMoreItem() {
      this.item.data.push({
        capacity: null,
        price: null
      });
    },

    removeItem(index) {
      this.item.data.splice(index, 1);
    }
  }
});

export default DataPackageFormDialog;
export type DataPackageFormDialogRef = InstanceType<
  typeof DataPackageFormDialog
>;
</script>

<style scoped>
.custom-number-field {
  margin-top: -12px !important;
}
.custom-radio {
  margin-top: -15px !important;
}
</style>
