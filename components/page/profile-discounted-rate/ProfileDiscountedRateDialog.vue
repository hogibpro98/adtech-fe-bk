<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :loading="loading"
    :label-button-confirm="labelButtonConfirm"
    @on-submit="handleSubmit"
  >
    <template slot="content">
      <v-flex xs12>
        <v-text-field-with-validation
          v-model="defaultItem.name"
          rules="required|max:255"
          required
          name="name"
          counter="255"
          maxlength="255"
          label="Tên chính sách chiết khấu"
        >
        </v-text-field-with-validation>
      </v-flex>
      <v-row xs12 class="mt-3">
        <v-col
          class="col-11 d-flex justify-content-space-between align-items-center"
        >
          <h3>Chính sách chiết khấu:</h3>
        </v-col>
        <v-col class="col-1 justify-content-center d-flex">
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                :disabled="defaultItem.discount_config.length > 9"
                v-on="on"
                @click="handleAddConfig"
              >
                <v-icon color="success">
                  mdi-plus
                </v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row
        v-for="(item, index) in defaultItem.discount_config"
        :key="index"
        class="align-items-center justify-content-space-between mt-n1"
        xs12
      >
        <v-col class="w-45-percent">
          <v-number-field-with-validation
            v-model.number="item.money"
            required
            rules="required|min_value:0"
            class="mt-n4 pt-0"
            :name="`discount_config.${index}.money`"
            min-value-fixed="0"
            min-value="0"
            label="Số tiền"
            suffix="đ"
            persistent-hint
          ></v-number-field-with-validation>
        </v-col>
        <v-col class="w-45-percent">
          <v-number-field-with-validation
            v-model.number="item.discounted_rates"
            required
            :name="`discount_config.${index}.discounted_rates`"
            rules="required|min_value:0|max_value:100"
            class="mt-n4 pt-0"
            decimal
            min-value-fixed="0"
            min-value="0"
            label="Tỉ lệ chiết khấu"
            suffix="%"
            persistent-hint
          ></v-number-field-with-validation>
        </v-col>
        <v-col class="col-1 mt-4 d-flex justify-content-center">
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                :disabled="isDisableDelete"
                v-on="on"
                @click="handleDeleteConfigDiscount(index)"
              >
                <v-icon color="error">
                  mdi-delete
                </v-icon>
              </v-btn>
            </template>
            <span>Xóa config discounted</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import FormDialog from "~/components/common/FormDialog.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
const ProfileDiscountedRateDialog = Vue.extend({
  name: "ProfileDiscountedRateDialog",
  components: {
    FormDialog,
    VTextFieldWithValidation,
    VNumberFieldWithValidation,
    VTextAreaWithValidation
  },
  data() {
    return {
      loading: false,
      isEdit: false,
      defaultItem: {
        name: "",
        discount_config: [
          {
            money: 0,
            discounted_rates: 0
          }
        ]
      }
    };
  },
  computed: {
    isDisableDelete() {
      return this.defaultItem.discount_config.length < 2;
    },
    title() {
      if (this.isEdit) {
        return "Cập nhật chính sách chiết khấu";
      } else {
        return "Thêm mới chính sách chiết khấu";
      }
    },
    labelButtonConfirm() {
      if (this.isEdit) {
        return "Cập nhật";
      } else {
        return "Xác nhận";
      }
    }
  },
  methods: {
    handleSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },
    async editItem() {
      this.loading = true;
      try {
        const result = await this.$axios.post(
          "discount-profile/update",
          this.defaultItem
        );
        if (result.data.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("cập nhật chiết khấu");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      } finally {
        this.loading = false;
      }
    },
    async addItem() {
      this.loading = true;
      try {
        const result = await this.$axios.post(
          "discount-profile/store",
          this.defaultItem
        );
        if (result.data.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("thêm mới chiết khấu");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      } finally {
        this.loading = false;
      }
    },
    handleDeleteConfigDiscount(index) {
      if (this.defaultItem.discount_config.length > 1) {
        this.defaultItem.discount_config.splice(index, 1);
      }
    },
    show(item = null) {
      if (item) {
        this.defaultItem = cloneDeep(item);
        this.isEdit = true;
      } else {
        this.isEdit = false;
        this.defaultItem.name = "";
        this.defaultItem.discount_config = [
          {
            money: null,
            discounted_rates: null
          }
        ];
      }
      this.$refs.refFormDialog.show();
    },
    hide() {
      this.$refs.refFormDialog.hidden();
    },
    handleAddConfig() {
      this.defaultItem.discount_config.push({
        discounted_rates: null,
        money: null
      });
    }
  }
});

export default ProfileDiscountedRateDialog;
export type ProfileDiscountedRateDialogRef = InstanceType<
  typeof ProfileDiscountedRateDialog
>;
</script>

<style scoped>
.w-45-percent {
  flex: 0 0 45%;
  max-width: 45%;
}
</style>
