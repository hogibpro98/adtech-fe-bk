<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 lg10 xl8"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs6 lg7 xl8>
        <v-flex xs12 class="form-group">
          <campaign-select
            v-model="item.campaign"
            label="Chiến dịch"
            required
            :query-params="queryCampaign"
            show-price
            rules="required"
          />
        </v-flex>
        <v-flex xs12 class="form-group">
          <v-text-field-with-validation
            v-model="item.name"
            :counter="255"
            name="name"
            label="Tên phiếu tài trợ"
            required
            rules="required|max:255"
          />
        </v-flex>
        <v-flex xs12 class="mt-4">
          <date-range-picker-flat
            v-model="dateRange"
            :config-props="{
              maxDate: maxTimePicker,
              minDate: minTimePicker
            }"
            :attach="true"
            name="date_range"
            model-format="YYYY-MM-DD HH:mm:ss"
            label="Thời gian diễn ra"
            required
            rules="required"
            dense
            hide-details
            clearable
            auto-hide
          />
        </v-flex>
        <v-flex xs12>
          <v-number-field-with-validation
            v-model="item.budget"
            label="Ngân sách tài trợ data tối đa"
            hint="Ngân sách tối đa cho tài trợ data"
            persistent-hint
            name="budget"
            suffix="₫"
          />
        </v-flex>
        <v-flex xs12>
          <v-number-field-with-validation
            v-model="item.budget_msg"
            label="Ngân sách tin nhắn tối đa"
            hint="Ngân sách tối đa cho tin nhắn đính kèm và xác nhận"
            persistent-hint
            name="budget_msg"
            suffix="₫"
          />
        </v-flex>
        <v-flex xs12>
          <sms-template-select
            v-model="item.confirm_sms_template"
            label="Template tin nhắn xác nhận"
            :query-params="{
              select_template_type: 1
            }"
            hint="Tin nhắn này sẽ gửi sau khi thuê bao nhận được data"
            persistent-hint
            name="confirm_sms_template_id"
            required
            rules="required"
          />
        </v-flex>
        <v-flex xs12 class="form-group">
          <v-radio-with-validation
            v-model="item.sponsor_type"
            name="sponsor_type"
            label="Hình thức gửi"
            required
            :items="sponsorTypes"
            rules="required"
          />
        </v-flex>
        <v-flex xs12>
          <sms-template-select
            v-if="isMsg"
            v-model="item.sms_user_template"
            label="Template tin nhắn tích hợp"
            hint="Tin nhắn này sẽ gửi trước khi thuê bao nhận được data"
            persistent-hint
            name="sms_user_template_id"
            required
            rules="required"
          />
        </v-flex>
        <v-flex xs12 class="mt-4">
          <schedule-input
            v-if="isMsg"
            v-model="item.schedule"
            label="Khoảng thời gian gửi tin"
            name="schedule"
            required
            rules="required"
          />
        </v-flex>
        <v-flex xs12>
          <v-radio-with-validation
            v-model="item.target_type"
            name="target_type"
            label="Phương thức chạy tài trợ"
            required
            :items="targetTypes"
            rules="required"
          />
        </v-flex>
        <v-flex v-if="isFile" xs12 class="mt-2">
          <file-upload
            v-model="item.params_file"
            :accept="DOCUMENT_CSV_TXT"
            :max-file-size="30"
            height="150px"
            name="params_file"
            class="form-upload"
            required
            rules="required"
            label="File targeting tin nhắn động"
          >
          </file-upload>
          <a
            href="/targeting/templates/Template_upload_data_official.xlsx"
            download
          >
            Hướng dẫn file targeting
          </a>
        </v-flex>
      </v-flex>
      <v-flex xs6 lg5 xl4 class="justify-content-center align-items-center">
        <preview-banner-m-m-s class="mt-4" :header="showContent" />
      </v-flex>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import moment from 'moment/src/moment';
import { union } from "lodash";
import { FormDialogRef } from "../../common/FormDialog.vue";
import {
  PhoneGroupInterface,
  PhoneGroupInterface
} from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import FileUpload from "~/components/common/FileUpload/index.vue";
import { DOCUMENT_CSV_TXT } from "~/constants/fileType";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import { ROLE_IS_ADMIN } from "~/constants/role";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import Campaign from "~/pages/log/campaign.vue";
import CampaignSelect from "~/components/select/CampaignSelect.vue";
import VCheckboxWithValidation from "~/components/common/VCheckboxWithValidation.vue";
import ScheduleInput from "~/components/common/ScheduleInput.vue";
import DateRangePickerFlat from "~/components/common/DateRangePickerFlat.vue";
import { isEmpty } from "~/util/typeof";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import SmsTemplateSelect from "~/components/select/SmsTemplateSelect.vue";
import PreviewBannerMMS from "~/components/page/manage-campaign/banner/common/PreviewBannerMMS.vue";
import VRadioWithValidation from "~/components/common/VRadioWithValidation.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: PhoneGroupInterface;
  $refs: { refFormDialog: FormDialogRef };
  $phoneGroupRepository: RepositoryInterface;
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
  campaign: null,
  target_type: "file",
  sponsor_type: "direct",
  confirm_sms_template: null,
  sms_user_template: null,
  params_file: null
};

/**
 * @property {Object} $phoneGroupRepository
 */

const AdsDataFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "AdsDataFormDialog",
  components: {
    VRadioWithValidation,
    PreviewBannerMMS,
    SmsTemplateSelect,
    VNumberFieldWithValidation,
    DateRangePickerFlat,
    ScheduleInput,
    VCheckboxWithValidation,
    CampaignSelect,
    Campaign,
    VSelectWithValidation,
    AgencyAdvertiserSelect,
    FileUpload,
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
      DOCUMENT_CSV_TXT,
      item: cloneDeep(DEFAULT_ITEM),
      sponsorTypes: [
        {
          text: "Tin nhắn xác nhận",
          value: "direct"
        },
        {
          text: "Tin xác nhận + Tin quảng cáo",
          value: "msg"
        }
      ],
      targetTypes: [
        {
          text: "Tải file danh sách",
          value: "file"
        },
        {
          text: "Gọi API",
          value: "api"
        }
      ],
      dateRange: [],
      showConfirm: true
    };
  },
  computed: {
    showContent() {
      if (this.item.sms_user_template?.content && !this.showConfirm) {
        return this.item.sms_user_template?.content;
      } else {
        return this.item.confirm_sms_template?.content || "";
      }
    },
    isAdmin() {
      return this.$authHasRole(ROLE_IS_ADMIN);
    },
    isMsg() {
      return this.item.sponsor_type === "msg";
    },
    isFile() {
      return this.item.target_type === "file";
    },
    budgetRules() {
      if (this.item.campaign) {
        return {
          max_value: this.item.campaign.remain_budget_create_ads
        };
      }
      return {};
    },
    queryCampaign() {
      return {
        select_status: ["waiting", "running", "pause"]
      };
    },
    minTimePicker() {
      const startTime = this.item.campaign?.start_time;
      const timeMin =
        startTime < Date.now() || !startTime ? Date.now() : startTime;
      return moment(timeMin)
        .startOf("day")
        .toDate()
        .getTime();
    },
    maxTimePicker() {
      const endTime = this.item.campaign?.end_time;
      const timeMax = endTime < Date.now() ? Date.now() : endTime;
      if (endTime) {
        return moment(timeMax)
          .endOf("day")
          .toDate()
          .getTime();
      }

      return undefined;
    }
  },
  watch: {
    isMsg(val) {
      if (!val) {
        this.item.sms_user_template = null;
      }
    },
    isFile(val) {
      if (!val) {
        this.item.params_file = null;
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null, isClone = false) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        this.dateRange = [item.start_time, item.end_time];
        if (isClone) {
          this.isEdit = false;
          this.item.name = "Bản sao " + item.name;
        }
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} tài trợ data`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
      this.dateRange = [];
    },
    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },
    mapData() {
      const data = cloneDeep(this.item);
      if (data.campaign) {
        data.campaign_id = data.campaign.id;
      }
      data.confirm_sms_template_id = data.confirm_sms_template?.id || null;
      if (data.sponsor_type === "msg") {
        data.sms_user_template_id = data.sms_user_template?.id || null;
      } else {
        data.sms_user_template_id = null;
      }
      if (data.target_type === "api") {
        data.params_file = null;
      }
      const [start, end] = this.dateRange;
      data.start_time = start || null;
      data.end_time = end || null;
      data.schedule = this.isMsg ? data.schedule : [];
      return data;
    },

    async addItem() {
      this.loading = true;
      const data = this.mapData();
      try {
        const res = await this.$adsDataRepository.create(data);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("tài trợ data");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          const errors = e.response.data.errors;
          if (errors.start_time || errors.end_time) {
            errors.date_range = union(
              errors.start_time || [],
              errors.end_time || []
            );
          }
          this.$refs.refFormDialog.setErrors(errors);
        }
      }
    },

    async editItem() {
      this.loading = true;
      const data = this.mapData();
      try {
        const res = await this.$adsDataRepository.update(data);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("tài trợ data");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        console.log(e);
        if (e.response && e.response.status === HTTP_CODE_422) {
          const errors = e.response.data.errors;
          if (errors.start_time || errors.end_time) {
            errors.date_range = union(
              errors.start_time || [],
              errors.end_time || []
            );
          }
          this.$refs.refFormDialog.setErrors(errors);
        }
      }
    },
    switchContent() {
      this.showConfirm = !this.showConfirm;
    }
  }
});

export default AdsDataFormDialog;
export type AdsDataFormDialogRef = InstanceType<typeof AdsDataFormDialog>;
</script>
