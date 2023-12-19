<template>
  <v-layout flex wrap>
    <v-flex xs12 class="">
      <v-text-field-with-validation
        v-model="innerValue.representative"
        :loading="loading"
        :readonly="readonly"
        name="representative"
        type="text"
        label="Người đại diện"
        required
        rules="required|max:100"
      />
    </v-flex>
    <v-flex xs12 class="">
      <v-text-field-with-validation
        v-model="innerValue.tax_no"
        :loading="loading"
        :disabled="!readonly"
        :readonly="readonly"
        name="tax_no"
        type="text"
        label="Mã số thuế"
        required
        rules="required|max:100|numeric"
      />
    </v-flex>
    <v-flex xs12 class="">
      <v-text-area-with-validation
        v-model="innerValue.address"
        :loading="loading"
        :counter="500"
        :readonly="readonly"
        name="address"
        label="Địa chỉ"
        rows="3"
        required
        rules="required|max:500"
      />
    </v-flex>
    <v-flex xs12 class=" py-2">
      <file-upload
        :value="innerValue.cooperation_proposal_document | jsonObject"
        :accept="acceptFileTypes"
        disabled
        label="Công văn đề xuất hợp tác"
        class="registration-upload"
        name="cooperation_proposal_document"
        height="150px"
        return-object
      ></file-upload>
    </v-flex>
    <v-flex xs12 class=" py-2">
      <file-upload
        :value="innerValue.business_registration_document | jsonObject"
        :accept="acceptFileTypes"
        disabled
        label="Đăng ký kinh doanh"
        class="registration-upload"
        name="business_registration_document"
        height="150px"
        return-object
      ></file-upload>
    </v-flex>
    <v-flex xs12 class=" py-2">
      <file-upload
        :value="innerValue.capacity_statement_document | jsonObject"
        :accept="acceptFileTypes"
        disabled
        label="Hồ sơ năng lực"
        name="capacity_statement_document"
        class="registration-upload"
        height="150px"
        return-object
      ></file-upload>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import deepWrapper from "@/mixins/deepWrapper";
import VTextFieldWithValidation from "@/components/common/VTextFieldWithValidation.vue";
import VTextAreaWithValidation from "@/components/common/VTextAreaWithValidation.vue";
import FileUpload from "@/components/common/FileUpload/index";
import { DOCUMENT } from "@/constants/fileType";
import Vue from "vue";

export default Vue.extend({
  name: "AgencyInfo",
  components: { FileUpload, VTextAreaWithValidation, VTextFieldWithValidation },
  mixins: [deepWrapper],
  props: {
    value: {
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      acceptFileTypes: DOCUMENT
    };
  }
});
</script>
