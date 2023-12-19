<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :loading="loading"
    :label-button-confirm="labelButtonConfirm"
    content-class="flex xs12 lg9 xl7"
    @on-submit="handleSubmit"
  >
    <template slot="content">
      <v-flex xs12>
        <h2>Tên Agency: {{ item.username }}</h2>
      </v-flex>
      <div class="w-full">
        <v-row class="mt-3 mr-3">
          <v-col
            class="col-11 d-flex justify-content-space-between align-items-center"
          >
            <h4>Thêm mới cấu hình:</h4>
          </v-col>
          <v-col class="col-1 justify-content-center d-flex">
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" @click="handleAddConfig">
                  <v-icon color="success">
                    mdi-plus
                  </v-icon>
                </v-btn>
              </template>
              <span>Thêm mới cấu hình nhà mạng</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row
          v-for="(quota, index) in item.quota_configs"
          :key="index"
          justify="space-between"
          align="center"
          class=" mt-1"
        >
          <v-col class="w-45-percent" xs5 lg5 xl5 md5>
            <telco-select
              v-model="quota.telco_code"
              :loading="loading"
              :name="`quota_configs.${index}.telco_code`"
              :return-object="false"
              label="Nhà mạng"
              item-value="code"
              required
              rules="required"
            />
          </v-col>
          <v-col class="w-45-percent" xs2 md2>
            <v-number-field-with-validation
              v-model.number="quota.quota_month"
              :loading="loading"
              :name="`quota_configs.${index}.quota_month`"
              label="Số tin nhắn tối đa 1 tháng"
              required
              min-value="1"
              :rules="`required|min_value:1|max_value:${quota.quota_year}`"
            />
          </v-col>

          <v-col class="w-45-percent" xs3 md3>
            <v-number-field-with-validation
              v-model.number="quota.quota_year"
              :loading="loading"
              :name="`quota_configs.${index}.quota_year`"
              label="Số tin nhắn tối đa 1 năm"
              required
              min-value="1"
              :rules="`required|max_value:99999999999999|min_value:1`"
            />
          </v-col>
          <v-col class="w-45-percent" xs2 md2>
            <v-number-field-with-validation
              v-model.number="quota.warning_threshold"
              :loading="loading"
              :name="`quota_configs.${index}.warning_threshold`"
              decimal
              min-value-fixed="0"
              min-value="0"
              label="Ngưỡng cảnh báo"
              required
              suffix="%"
              :rules="`required|max_value:100|min_value:1`"
            />
          </v-col>

          <v-col class="col-1 mt-4 d-flex justify-content-center">
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="handleDelete(index)"
                >
                  <v-icon color="error">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </template>
              <span>Xóa cấu hình quota</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import TelcoSelect from "@/components/select/TelcoSelect.vue";
import FormDialog from "~/components/common/FormDialog.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";

const DEFAULT_ITEM = {
  id: null,
  name: "",
  quota_configs: [
    {
      telco_code: "",
      quota_month: 0,
      quota_year: 0,
      warning_threshold: 0
    }
  ]
};

const QuotaDialog = Vue.extend({
  name: "QuotaDialog",
  components: {
    FormDialog,
    VTextFieldWithValidation,
    VNumberFieldWithValidation,
    VTextAreaWithValidation,
    TelcoSelect
  },
  data() {
    return {
      loading: false,
      isEdit: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    title() {
      return "Cấu hình Quota nhà mạng";
    },
    labelButtonConfirm() {
      return "Xác nhận";
    }
  },
  methods: {
    handleSubmit() {
      if (this.isEdit) {
        this.editItem();
      }
    },
    async editItem() {
      this.loading = true;
      // const data = {
      //   id: this.item.id,
      //   quotas: this.item.quotas
      // };
      try {
        const result = await this.$axios.$post(
          "user-telco-quota/update",
          this.item
        );
        if (result.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("cập nhật Quota nhà mạng");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          console.log(e.response);
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      } finally {
        this.loading = false;
      }
    },
    handleDelete(index) {
      this.item.quota_configs.splice(index, 1);
    },
    show(item) {
      if (item) {
        this.item = cloneDeep(item);
        if (!item.quota_configs) {
          this.$set(this.item, "quota_configs", [
            {
              telco_code: "",
              quota_month: 0,
              quota_year: 0,
              warning_threshold: 0
            }
          ]);
        }
        this.isEdit = true;
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }
      this.$refs.refFormDialog.show();
    },
    hide() {
      this.$refs.refFormDialog.hidden();
    },
    handleAddConfig() {
      this.item.quota_configs.push({
        telco_code: "",
        quota_month: 0,
        quota_year: 0,
        warning_threshold: 0
      });
    }
  }
});

export default QuotaDialog;
export type ProfileDiscountedRateDialogRef = InstanceType<typeof QuotaDialog>;
</script>

<style scoped>
.w-45-percent {
  /*flex: 0 0 45%;*/
  /*max-width: 45%;*/
}
</style>
