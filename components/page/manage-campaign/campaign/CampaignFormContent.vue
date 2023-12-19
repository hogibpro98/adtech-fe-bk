<template>
  <v-row>
    <v-flex sm12 class="form-group pr-1">
      <v-text-field-with-validation
        v-model="innerValue.name"
        :loading="loading"
        :disabled="isEdit"
        name="name"
        type="text"
        label="Tên"
        required
        counter="200"
        rules="required|max:200"
      />
    </v-flex>
    <v-flex sm12 class="form-group">
      <date-range-picker-flat
        v-model="period"
        :loading="loading"
        :config-props="{
          minDate: minDateCampaign
        }"
        model-format="YYYY-MM-DD HH:mm:ss"
        name="period"
        label="Thời gian diễn ra"
        rows="3"
        required
        auto-hide
        rules="required"
      />
    </v-flex>
    <v-flex sm12 class="form-group">
      <v-number-field-with-validation
        v-model="innerValue.budget"
        :loading="loading"
        :suffix="innerValue.budget ? '₫' : ''"
        required
        :decimal="false"
        name="budget"
        label="Ngân sách dự kiến"
        rules="required|min_value:1|max:14"
      />
    </v-flex>
    <v-flex sm12 class="form-group">
      <agency-advertiser-select
        v-model="owner"
        :loading="loading"
        :disabled="isEdit"
        :query-params="{
          include_me: true
        }"
        required
        rules="required"
        name="agency-advertiser"
        type="text"
        label="Người sở hữu"
      />
    </v-flex>
    <v-flex sm12 class="form-group">
      <zone-select
        v-model="innerValue.zone"
        :loading="loading"
        :disabled="isEdit"
        :query-params="{
          custom_zone_campaign: true
        }"
        name="zone_id"
        type="text"
        label="Khu vực hiển thị"
      />
    </v-flex>
  </v-row>
</template>
<script lang="ts">
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { ROLE_AGENCY } from "@/constants/role";
import wrapper from "@/mixins/wrapper";
import DateRangePickerFlat from "@/components/common/DateRangePickerFlat";
// @ts-ignore
import moment from 'moment/src/moment';
import { isEqual } from "lodash";
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { convertPeriodTimeToArray } from "~/util/time";
import { CampaignInterface } from "~/interface/data/campaign";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { UserInterface } from "~/interface/data/user";
import ZoneSelect from "~/components/select/ZoneSelect.vue";

interface ComponentData {
  period: Array<string | number | object>;
  owner: UserInterface;
  innerValue: CampaignInterface;
  $campaignRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethod {}

const CampaignFormContent = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "CampaignFormContent",
  components: {
    VNumberFieldWithValidation,
    AgencyAdvertiserSelect,
    DateRangePickerFlat,
    VTextFieldWithValidation,
    ZoneSelect
  },
  mixins: [wrapper],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      period: [],
      owner: null,
      innerValue: {}
    };
  },
  computed: {
    isRequireOwner() {
      return !this.$authHasRole(ROLE_AGENCY);
    },
    periodProps() {
      return [this.innerValue.start_time, this.innerValue.end_time];
    },
    periodTime() {
      return this.period;
    },
    ownerItem() {
      if (this.innerValue?.advertiser) {
        return {
          ...this.innerValue.advertiser,
          is_agency: false,
          agency: this.innerValue.agency
        };
      } else if (this.innerValue?.agency) {
        return {
          ...this.innerValue.agency,
          is_agency: true
        };
      }
      return null;
    },
    minDateCampaign() {
      if (!this.isEdit) {
        return moment()
          .startOf("day")
          .toDate();
      }

      return undefined;
    },
    campaign() {
      return this.innerValue?.campaign?.zone || null;
    }
  },
  watch: {
    period(val) {
      if (!isEqual(val, this.periodProps)) {
        const [startTime, endTime] = val || [];
        this.innerValue.start_time = startTime;
        this.innerValue.end_time = endTime;
      }
    },
    periodProps(val) {
      this.period = val;
    },
    owner(val) {
      if (val.is_agency) {
        if (val.id !== this.innerValue.agency_id) {
          this.innerValue.agency_id = val.id;
          this.innerValue.agency = val;
          this.innerValue.advertiser_id = null;
          this.innerValue.advertiser = null;
        }
      } else if (val.id !== this.innerValue.advertiser_id) {
        const agency = val.agency || {};
        this.innerValue.agency_id = agency.id;
        this.innerValue.agency = agency;
        this.innerValue.advertiser_id = val.id;
        this.innerValue.advertiser = val;
      }
    },
    ownerItem(val) {
      if (val) {
        if (!this.owner || val.id !== this.owner.id) {
          this.owner = val;
        }
      } else {
        this.owner = null;
      }
    }
  }
});

export default CampaignFormContent;
export type CampaignFormContentRef = InstanceType<typeof CampaignFormContent>;
</script>
