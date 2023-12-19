// @ts-ignore
import moment from "moment/src/moment";
import { convertArrayByField } from "~/util/array";
import {
  BannerMMSInterface,
  BannerRedirectInterface,
  BannerSmsInterface,
  SliderDataInterface
} from "~/interface/data/banner";
import { CampaignInterface } from "~/interface/data/campaign";
import { SQL_DATE, SQL_TIMESTAMP } from "~/constants/format";

const fieldCode = "code";
const fieldId = "id";

const getTime = (str?: string | number): number => {
  if (str) {
    return moment(str)
      .toDate()
      .getTime();
  }
  return moment()
    .toDate()
    .getTime();
};

export const convertDataToUpdateAdsRedirect = function(
  item: BannerRedirectInterface
): BannerRedirectInterface {
  const data: BannerRedirectInterface = {};
  data.id = item.id;
  data.title = item.title;
  data.name = item.name;
  data.description = item.description;

  data.threshold = item?.threshold_obj?.threshold;
  data.threshold_obj = item?.threshold_obj;

  data.campaign_id = item.campaign && item.campaign.id;
  data.url = item.url;
  data.pricing_mode = item.pricing_mode;
  data.budget_mode = item.budget_mode;

  if (data.pricing_mode === "cpc") {
    if (data.budget_mode === "limit_by_day") {
      data.max_click_per_day = item.max_click_per_day;
    } else {
      data.max_click = item.max_click;
    }
    data.cpc = {
      min: item?.cpc?.min,
      max: item?.cpc?.max
    };
  } else if (data.pricing_mode === "cpm") {
    if (data.budget_mode === "limit_by_day") {
      data.max_view_per_day = item.max_view_per_day;
    } else {
      data.max_view = item.max_view;
    }
    data.cpm = {
      min: item?.cpm?.min,
      max: item?.cpm?.max
    };
  }

  data.start_time = item.start_time;
  data.end_time = item.end_time;
  data.ads_type_id = item.ads_type && item.ads_type.id;
  data.media = item.media;
  data.media_type = item?.ads_type?.media_type || item?.media_type;

  data.channels = convertArrayByField(item.channels, fieldId);
  data.tags = convertArrayByField(item.tags, fieldCode);
  data.genders = convertArrayByField(item.genders, fieldCode);
  data.os = convertArrayByField(item.os, fieldCode);
  data.locations = convertArrayByField(item.locations, fieldCode);
  data.exclude_locations = convertArrayByField(
    item.exclude_locations,
    fieldCode
  );
  data.workplaces = convertArrayByField(item.workplaces, fieldCode);
  data.exclude_workplaces = convertArrayByField(
    item.exclude_workplaces,
    fieldCode
  );
  data.network_suppliers = convertArrayByField(
    item.network_suppliers,
    fieldCode
  );
  data.relationships = convertArrayByField(item.relationships, fieldCode);
  data.devices = convertArrayByField(item.devices, fieldCode);
  data.phone_names = convertArrayByField(item.phone_names, fieldCode);
  data.network_data = convertArrayByField(item.network_data, fieldCode);
  data.service_package = convertArrayByField(item.service_package, fieldCode);
  data.sim_ages = convertArrayByField(item.sim_ages);
  data.data_fee = convertArrayByField(item.data_fee);
  data.phone_fee = convertArrayByField(item.phone_fee);
  data.arpu = convertArrayByField(item.arpu);
  data.ages = convertArrayByField(item.ages);
  data.use_data = item.use_data;
  if (item.use_data) {
    data.data_code = item.data_code;
    data.data_capacity = item.data_capacity;
    data.confirm_sms_template_id = item.confirm_sms_template?.id;
    data.questions = item.questions;
    data.max_per_phone = item.max_per_phone;
    data.max_per_ip = item.max_per_ip;
    data.data_trigger_time = item.data_trigger_time;
  } else {
    data.data_code = null;
    data.data_capacity = null;
    data.confirm_sms_template_id = null;
    data.questions = [];
    data.max_per_phone = null;
    data.max_per_ip = null;
  }
  data.event_trackings = item.event_trackings;
  data.group_age = item.group_age;
  data.group_age_id = item.group_age_id;

  return data;
};

export const convertDataToUpdateAdsMMS = function(
  item: BannerMMSInterface = {}
): BannerMMSInterface {
  const data: BannerMMSInterface = {};
  data.id = item.id;
  data.name = item.name;
  data.mms_type = item.mms_type || 0;
  data.campaign_id = item?.campaign?.id;
  data.brandname_id = item?.brandname?.id;
  data.start_time = item.start_time;
  data.end_time = item.end_time;
  data.start_hour = item.start_hour;
  data.end_hour = item.end_hour;
  data.content = item.content;
  data.budget_mode = item.budget_mode;

  if (data.budget_mode === "unlimit") {
    data.max_mms = item.max_mms;
  } else {
    data.max_mms_per_day = item.max_mms_per_day;
  }

  if (item.backup_sms) {
    data.backup_sms = item.backup_sms;
  }
  if (item.header) {
    data.header = item.header;
  }
  data.targeting_type = item.targeting_type;
  data.target_file = item.target_file;
  data.ages = convertArrayByField(item.ages);
  data.tags = convertArrayByField(item.tags, fieldCode);
  data.genders = convertArrayByField(item.genders, fieldCode);
  data.os = convertArrayByField(item.os, fieldCode);
  data.locations = convertArrayByField(item.locations, fieldCode);
  data.exclude_locations = convertArrayByField(
    item.exclude_locations,
    fieldCode
  );
  data.workplaces = convertArrayByField(item.workplaces, fieldCode);
  data.exclude_workplaces = convertArrayByField(
    item.exclude_workplaces,
    fieldCode
  );
  data.network_suppliers = convertArrayByField(
    item.network_suppliers,
    fieldCode
  );
  data.relationships = convertArrayByField(item.relationships, fieldCode);
  data.devices = convertArrayByField(item.devices, fieldCode);
  data.phone_names = convertArrayByField(item.phone_names, fieldCode);
  data.network_data = convertArrayByField(item.network_data, fieldCode);
  data.service_package = convertArrayByField(item.service_package, fieldCode);
  data.sim_ages = convertArrayByField(item.sim_ages);
  data.data_fee = convertArrayByField(item.data_fee);
  data.phone_fee = convertArrayByField(item.phone_fee);
  data.arpu = convertArrayByField(item.arpu);
  data.schedule = convertArrayByField(item.schedule);
  data.cat_id = item.cat_id;
  data.content_type = item.content_type;
  if (item.template && item.template.id) {
    data.mms_user_template_id = item.template.id;
  }

  if (item.targeting_type === "phone_group") {
    data.phone_group_id = item.phone_group.id;
  } else {
    data.phone_group_id = null;
  }
  if (item.content_type) {
    data.params_file = item.params_file;
  }

  if (item.has_backup) {
    data.has_backup = item.has_backup;
    data.backup_sms = item.backup_sms;
    data.backup_sms.content_type = item.backup_sms.content_type || 0;
  }

  return data;
};

export const convertDataToUpdateAdsSms = function(
  item: BannerSmsInterface = {}
): BannerSmsInterface {
  const data: BannerSmsInterface = {};
  data.id = item.id;
  data.name = item.name;
  data.sms_type = item.sms_type || 0;
  data.campaign_id = item?.campaign?.id;
  data.brandname_id = item?.brandname?.id;
  data.start_time = item.start_time;
  data.end_time = item.end_time;
  data.start_hour = item.start_hour;
  data.end_hour = item.end_hour;
  data.content = item.content;
  data.budget_mode = item.budget_mode;
  if (data.budget_mode === "unlimit") {
    data.max_sms = item.max_sms;
  } else {
    data.max_sms_per_day = item.max_sms_per_day;
  }

  if (item.header) {
    data.header = item.header;
  }
  data.targeting_type = item.targeting_type;
  data.target_file = item.target_file;
  data.ages = convertArrayByField(item.ages);
  data.tags = convertArrayByField(item.tags, fieldCode);
  data.genders = convertArrayByField(item.genders, fieldCode);
  data.os = convertArrayByField(item.os, fieldCode);
  data.locations = convertArrayByField(item.locations, fieldCode);
  data.exclude_locations = convertArrayByField(
    item.exclude_locations,
    fieldCode
  );
  data.workplaces = convertArrayByField(item.workplaces, fieldCode);
  data.exclude_workplaces = convertArrayByField(
    item.exclude_workplaces,
    fieldCode
  );
  data.network_suppliers = convertArrayByField(
    item.network_suppliers,
    fieldCode
  );
  data.relationships = convertArrayByField(item.relationships, fieldCode);
  data.devices = convertArrayByField(item.devices, fieldCode);
  data.phone_names = convertArrayByField(item.phone_names, fieldCode);
  data.network_data = convertArrayByField(item.network_data, fieldCode);
  data.service_package = convertArrayByField(item.service_package, fieldCode);
  data.sim_ages = convertArrayByField(item.sim_ages);
  data.data_fee = convertArrayByField(item.data_fee);
  data.phone_fee = convertArrayByField(item.phone_fee);
  data.arpu = convertArrayByField(item.arpu);
  data.schedule = convertArrayByField(item.schedule);
  data.cat_id = item.cat_id;
  data.content_type = item.content_type;
  if (item.template && item.template.id) {
    data.sms_user_template_id = item.template.id;
  }
  if (item.content_type) {
    data.params_file = item.params_file;
  }
  if (item.targeting_type === "phone_group") {
    data.phone_group_id = item.phone_group.id;
  } else {
    data.phone_group_id = null;
  }

  return data;
};

export const convertDataToUpdateCampaign = function(
  newCampaign: CampaignInterface
): CampaignInterface {
  if (!newCampaign) return;
  const owner = newCampaign.owner;
  const [startDate, endDate] = newCampaign.period;
  const dataNewCampaign: CampaignInterface = {
    agency_id: "",
    advertiser_id: "",
    start_time: "",
    end_time: "",
    name: newCampaign.name,
    zone_id: newCampaign.zone?.id,
    budget: newCampaign.budget
  };

  if (owner) {
    if (owner.is_agency) {
      dataNewCampaign.agency_id = owner.id;
    } else {
      const agency = owner.agency || {};
      dataNewCampaign.agency_id = agency.id;
      dataNewCampaign.advertiser_id = owner.id;
    }
  }

  if (startDate) {
    dataNewCampaign.start_time = startDate;
  } else {
    dataNewCampaign.start_time = moment()
      .startOf("day")
      .format(SQL_TIMESTAMP);
  }

  if (endDate) {
    dataNewCampaign.end_time = endDate;
  } else {
    dataNewCampaign.end_time = dataNewCampaign.start_time;
  }
  return dataNewCampaign;
};

export const generateName = (
  item: SliderDataInterface,
  init?: string
): string => `Từ ${item?.min} đến ${item?.max}${init ? ` ${init}` : ""}`;
