<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    content-class="flex xs12 md6 lg6 xl4"
    :loading="loading"
    v-bind="$attrs"
    v-on="$listeners"
    @on-submit="onSubmit"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="defaultItem.count_msg_length.max_length"
          name="max_length"
          label="Chiều dài nội dung"
          rules="required|min_value:1|max_value:9999999999"
          immediate
          required
          :decimal="false"
          min-value="0"
        ></v-number-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="defaultItem.count_msg_length.max_sms"
          name="max_sms"
          rules="required|min_value:1"
          required
          :decimal="false"
          label="Số tin tối đa"
          min-value="1"
        >
        </v-number-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-number-field-with-validation
          v-model="defaultItem.count_msg_length.count_special_character"
          label="Đơn vị quy đổi chiều dài của kí tự đặc biệt"
          rules="required"
          :decimal="false"
          name="count_special_character"
          required
          min-value="0"
        >
        </v-number-field-with-validation>
      </v-flex>
      <v-flex xs12 class="form-group">
        <v-row class="align-items-center mt-4">
          <v-col class="col-11 py-0">
            <h3>Cấu hình độ dài tin nhắn:</h3>
          </v-col>
          <v-col class="col-11 py-0">
            <span v-show="errorConfigRes" class="red--text">{{
              errorConfigRes
            }}</span>
          </v-col>
          <v-col class="col-1 py-0">
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn
                  :disabled="isDisableAddConfig"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="handleAddConfig"
                >
                  <v-icon color="success">
                    mdi-plus
                  </v-icon>
                </v-btn>
              </template>
              <span>Thêm cấu hình tin</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row
          v-for="(item, index) in defaultItem.count_msg_length.config"
          :key="index"
          class="align-items-center mt-n3"
        >
          <v-col class="col-11">
            <v-number-field-with-validation
              v-model="item.sms_length"
              :label="`Tin thứ ${index + 1}`"
              :name="`config.${index}.sms_length`"
              min-value="0"
              :decimal="false"
              required
              rules="required"
            ></v-number-field-with-validation>
          </v-col>
          <v-col class="col-1 mt-5">
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  :disabled="isDisableDelete"
                  v-on="on"
                  @click="handleDeleteConfig(index)"
                >
                  <v-icon color="error">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </template>
              <span>Xóa cấu hình</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-flex>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import FormDialog from "~/components/common/FormDialog.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";

interface ComponentData {
  isEdit: boolean;
  loading: boolean;
  defaultItem: {
    count_msg_length: {
      config: Array<any>;
    };
  };
}
interface ComponentMethods {
  onSubmit(): void;
  editConfig(): void;
  addConfig(): void;
  handleDeleteConfig(index: number): void;
  handleAddConfig(): void;
  show(item: object): void;
  hide(): void;
}
interface ComponentComputed {
  isDisableDelete: boolean;
  title: string;
  labelButtonConfirm: string;
}
interface ComponentProps {}
const ConfigTelcoDialog = Vue.extend<
  ComponentData,
  ComponentMethods,
  ComponentComputed,
  ComponentProps
>({
  name: "ConfigTelcoDialog",
  components: {
    VNumberFieldWithValidation,
    FormDialog
  },
  data() {
    return {
      isEdit: false,
      loading: false,
      defaultItem: {
        count_msg_length: {
          config: []
        }
      },
      errorConfigRes: ""
    };
  },
  computed: {
    isDisableDelete() {
      return this.defaultItem.count_msg_length.config.length < 2;
    },
    title() {
      return "Cấu hình tin nhắn nhà mạng";
    },
    labelButtonConfirm() {
      return "Xác nhận";
    },
    isDisableAddConfig() {
      return (
        this.defaultItem.count_msg_length.config.length ==
        this.defaultItem.count_msg_length.max_sms
      );
    }
  },
  methods: {
    onSubmit() {
      if (this.isEdit) {
        this.editConfig();
      } else {
        this.addConfig();
      }
    },
    async editConfig() {
      this.loading = true;
      try {
        const result = await this.$axios.$post(
          "count-msg-length/update",
          this.defaultItem.count_msg_length
        );
        if (result.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("cập nhật cấu hình nhà mạng");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
          this.errorConfigRes = e.response.data.errors?.config[0];
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      } finally {
        this.loading = false;
      }
    },
    async addConfig() {
      this.loading = true;
      try {
        const result = await this.$axios.$post("count-msg-length/store", {
          telco_id: this.defaultItem.id,
          ...this.defaultItem.count_msg_length
        });
        if (result.code === CODE_SUCCESS) {
          this.$emit("action-success");
          this.$toast.global.action_success("thêm cấu hình nhà mạng");
          this.hide();
        } else {
          this.$toast.global.action_fail();
        }
        this.loading = false;
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
          this.errorConfigRes = e.response.data.errors?.config[0];
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      } finally {
        this.loading = false;
      }
    },
    handleDeleteConfig(index) {
      if (this.defaultItem.count_msg_length.config.length > 1) {
        this.defaultItem.count_msg_length.config.splice(index, 1);
      }
    },
    handleAddConfig() {
      if (
        this.defaultItem.count_msg_length.max_sms &&
        this.defaultItem.count_msg_length.config.length <
          this.defaultItem.count_msg_length.max_sms
      ) {
        this.defaultItem.count_msg_length.config.push({});
      }
    },
    show(item) {
      this.defaultItem = cloneDeep(item);
      this.errorConfigRes = "";
      if (!this.defaultItem.count_msg_length) {
        this.isEdit = false;
        this.defaultItem.count_msg_length = {
          config: [{}],
          count_special_character: null,
          max_length: null,
          max_sms: null
        };
      } else {
        this.isEdit = true;
        this.defaultItem.count_msg_length.config = JSON.parse(
          this.defaultItem.count_msg_length.config
        );
      }
      this.$refs.refFormDialog.show();
    },
    hide() {
      this.$refs.refFormDialog.hidden();
    }
  }
});
export default ConfigTelcoDialog;
</script>

<style scoped></style>
