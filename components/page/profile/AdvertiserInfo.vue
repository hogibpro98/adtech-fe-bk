<template>
  <v-layout flex wrap>
    <v-flex xs12 class="">
      <v-text-field-with-validation
        v-model="innerValue.representative"
        :loading="loading"
        name="representative"
        type="text"
        label="Người đại diện"
        rules="max:100"
        :readonly="readonly"
      />
    </v-flex>
    <v-flex xs12 class="">
      <v-text-field-with-validation
        v-model="innerValue.tax_no"
        :loading="loading"
        name="tax_no"
        type="text"
        label="Mã số thuế"
        rules="max:100|numeric"
        :readonly="readonly"
      />
    </v-flex>
    <v-flex xs12 class="">
      <v-text-area-with-validation
        v-model="innerValue.address"
        :loading="loading"
        :counter="500"
        name="address"
        label="Địa chỉ"
        rows="3"
        rules="max:500"
        :readonly="readonly"
      />
    </v-flex>
    <v-flex xs12 class="py-2">
      <file-upload
        :value="innerValue.documents | jsonObject"
        disabled
        :accept="acceptFileTypes"
        label="Tài liệu đính kèm"
        class="registration-upload"
        name="documents"
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
  name: "AdvertiserInfo",
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
