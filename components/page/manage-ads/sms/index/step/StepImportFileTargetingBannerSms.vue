<template>
  <v-row class="no-margin">
    <v-flex xs12>
      <file-upload
        v-model="innerValue.target_file"
        :accept="DOCUMENT_CSV_TXT"
        name="target_file"
        display-label="Danh sách thuê bao nhận tin nhắn (.csv, .txt)"
        label="Danh sách thuê bao nhận tin nhắn"
        required
        rules="required"
      />
    </v-flex>
    <v-flex xs12>
      <a
        href="/targeting/templates/phone_list.txt"
        download
      >
        Tải file mẫu
      </a>
    </v-flex>
    <v-card-subtitle
      class="no-padding caption text-center max-w-2xl mt-8 m-auto"
    >
      Danh sách thuê bao nhận tin nhắn phải có định dạng csv hoặc txt
      <br />
      Mỗi thuê bao sẽ nằm trên 1 dòng riêng biệt
    </v-card-subtitle>
  </v-row>
</template>
<script lang="ts">
import FileUpload from "@/components/common/FileUpload/index.vue";
import { DOCUMENT_CSV_TXT } from "@/constants/fileType";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { BannerMMSInterface } from "~/interface/data/banner";

interface ComponentData {
  DOCUMENT_CSV_TXT: Array<string>;
  innerValue: BannerMMSInterface;
}

const StepImportFileTargetingBannerSms = (Vue as VueConstructor<
  Vue & ComponentData
>).extend({
  name: "StepImportFileTargetingBannerSms",
  components: { FileUpload },
  mixins: [wrapper],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      DOCUMENT_CSV_TXT,
      innerValue: {}
    };
  }
});

export default StepImportFileTargetingBannerSms;
export type StepImportFileTargetingBannerSmsRef = InstanceType<
  typeof StepImportFileTargetingBannerSms
>;
</script>
