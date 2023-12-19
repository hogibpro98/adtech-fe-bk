import { Inject } from "@nuxt/types/app";
import createRepository from "~/api/repository";
import apiAction from "~/api/action";
import {
  ADS,
  ADS_CONFIG,
  AGENCY_PRICE,
  AGENCY_WALLET_TRANSACTION,
  BRANDNAME_REQUEST,
  BUSINESS_ACTIVITY,
  RECHARGE_REDIRECT,
  TRANSACTION_MMS_DAILY,
  TRANSACTION_REDIRECT_DAILY,
  PERMISSION,
  ROLE,
  USER,
  GROUP_AGE,
  TARGETING_TAG,
  MANAGE_LAYOUT,
  ADS_TYPE,
  LOCATION,
  INVENTORY_DISPLAY,
  CHANNEL,
  ZONE,
  CAMPAIGN,
  OS,
  BANNER,
  NETWORK,
  ADS_PRICE,
  GENDER,
  NOTIFICATION_PATTERN,
  ADVERTISER_BANNER,
  ADVERTISER_CAMPAIGN,
  ADVERTISER_CHANNEL,
  ADVERTISER_INVENTORY,
  ADVERTISER_ZONE,
  BRAND_NAME,
  DEVICE,
  NETWORK_DATA,
  RELATIONSHIP,
  SERVICE_PACKAGE,
  ADS_MMS,
  PHONE_NAME,
  AGENCY_WALLET,
  ADS_VIDEO_TYPE,
  WHITELIST_IP,
  SYSTEM_CONFIG,
  PHONE_GROUP,
  LOG_MMS_DISTRIBUTION,
  AGENCY_WALLET_SMS_TRANSACTION,
  TRANSACTION_SMS_DAILY,
  TEMPLATE_SMS,
  EMAIL_REPORT,
  FILE_REPORT,
  PRICE_SERVICE,
  TEMPLATE_MMS,
  ADS_SMS,
  USER_IP,
  LOG_SMS_DISTRIBUTION,
  LOG_SMS_vendor_DISTRIBUTION,
  DATA_PACKAGE,
  INVOICE,
  DATA_SPONSOR,
  RECHARGE_ORDER,
  SURVEY,
  MMS_DAY,
  SMS_DAY,
  DATA_DAY,
  SMS_VENDOR_DAY,
  TRANSACTION_SMS_VENDOR_DAILY,
  ADS_SMS_VENDOR,
  TEMPLATE_SMS_VENDOR,
  FEEDBACK,
  REPORT_REASON,
  BLOCKING_CATEGORY,
  BLOCK_URL,
  ADS_REVIEW,
  MACRO,
  ACTION_CATERORY,
  EVENT_TRACKING,
  POLICY,
  MANAGE_AGE_GROUP, CONSTRACT, SYNC_MANUAL_CAT_CONFIG, SYNC_MANUAL_BRANDNAME_CONFIG, SYNC_MANUAL_AGENCY_CONFIG
} from "~/constants/resource";
import GlobalDataInterface from "~/interface/data/global";

export default (ctx: GlobalDataInterface, inject: Inject) => {
  // inject the repository in the context (ctx.app.$repository)
  // And in the Vue instances (this.$repository in your components)
  const repositoryWithAxios = createRepository(ctx.$axios);
  inject("apiAction", apiAction(ctx.$axios));
  inject("permissionRepository", repositoryWithAxios(PERMISSION));
  inject("groupAgeRepository", repositoryWithAxios(GROUP_AGE));
  inject("roleRepository", repositoryWithAxios(ROLE));
  inject("userRepository", repositoryWithAxios(USER));
  inject("reportReasonRepository", repositoryWithAxios(REPORT_REASON));
  inject("targetingTagRepository", repositoryWithAxios(TARGETING_TAG));
  inject("manageLayoutRepository", repositoryWithAxios(MANAGE_LAYOUT));
  inject("adsTypeRepository", repositoryWithAxios(ADS_TYPE));
  inject("targetingLocationRepository", repositoryWithAxios(LOCATION));
  inject("inventoryDisplayRepository", repositoryWithAxios(INVENTORY_DISPLAY));
  inject("channelRepository", repositoryWithAxios(CHANNEL));
  inject("zoneRepository", repositoryWithAxios(ZONE));
  inject("campaignRepository", repositoryWithAxios(CAMPAIGN));
  inject("bannerRepository", repositoryWithAxios(BANNER));
  inject("adsMMSRepository", repositoryWithAxios(ADS_MMS));
  inject("MMSDayRepository", repositoryWithAxios(MMS_DAY));
  inject("SMSDayRepository", repositoryWithAxios(SMS_DAY));
  inject("SMSVendorDayRepository", repositoryWithAxios(SMS_VENDOR_DAY));
  inject("dataDayRepository", repositoryWithAxios(DATA_DAY));
  inject("adsSmsRepository", repositoryWithAxios(ADS_SMS));
  inject("adsSmsVendorRepository", repositoryWithAxios(ADS_SMS_VENDOR));
  inject("adsRepository", repositoryWithAxios(ADS));
  inject("genderRepository", repositoryWithAxios(GENDER));
  inject("osRepository", repositoryWithAxios(OS));
  inject("networkRepository", repositoryWithAxios(NETWORK));
  inject("adsPriceRepository", repositoryWithAxios(ADS_PRICE));
  inject("surveyRepository", repositoryWithAxios(SURVEY));
  inject(
    "notificationPatternRepository",
    repositoryWithAxios(NOTIFICATION_PATTERN)
  );
  inject("baseUrl", ctx.env.baseUrl);
  inject("advertiserBannerRepository", repositoryWithAxios(ADVERTISER_BANNER));
  inject(
    "advertiserCampaignRepository",
    repositoryWithAxios(ADVERTISER_CAMPAIGN)
  );
  inject(
    "advertiserChannelRepository",
    repositoryWithAxios(ADVERTISER_CHANNEL)
  );
  inject(
    "advertiserInventoryRepository",
    repositoryWithAxios(ADVERTISER_INVENTORY)
  );
  inject("advertiserZoneRepository", repositoryWithAxios(ADVERTISER_ZONE));
  inject("brandNameRepository", repositoryWithAxios(BRAND_NAME));
  inject("brandNameRequestRepository", repositoryWithAxios(BRANDNAME_REQUEST));

  inject("deviceRepository", repositoryWithAxios(DEVICE));
  inject("servicePackageRepository", repositoryWithAxios(SERVICE_PACKAGE));
  inject("relationshipRepository", repositoryWithAxios(RELATIONSHIP));
  inject("networkDataRepository", repositoryWithAxios(NETWORK_DATA));
  inject("phoneNameRepository", repositoryWithAxios(PHONE_NAME));
  inject("agencyWalletRepository", repositoryWithAxios(AGENCY_WALLET));
  inject("agencyPriceRepository", repositoryWithAxios(AGENCY_PRICE));
  inject("templateMmsRepository", repositoryWithAxios(TEMPLATE_MMS));
  inject("templateSmsRepository", repositoryWithAxios(TEMPLATE_SMS));
  inject(
    "templateSmsVendorRepository",
    repositoryWithAxios(TEMPLATE_SMS_VENDOR)
  );
  inject(
    "agencyWalletTransactionRepository",
    repositoryWithAxios(AGENCY_WALLET_TRANSACTION)
  );
  inject(
    "agencyWalletSmsTransactionRepository",
    repositoryWithAxios(AGENCY_WALLET_SMS_TRANSACTION)
  );
  inject("rechargeRedirectRepository", repositoryWithAxios(RECHARGE_REDIRECT));
  inject("businessActivityRepository", repositoryWithAxios(BUSINESS_ACTIVITY));
  inject("adsConfigRepository", repositoryWithAxios(ADS_CONFIG));
  inject(
    "transactionRedirectDailyRepository",
    repositoryWithAxios(TRANSACTION_REDIRECT_DAILY)
  );
  inject(
    "transactionMMSDailyRepository",
    repositoryWithAxios(TRANSACTION_MMS_DAILY)
  );
  inject(
    "transactionSMSDailyRepository",
    repositoryWithAxios(TRANSACTION_SMS_DAILY)
  );
  inject(
    "transactionSMSVendorDailyRepository",
    repositoryWithAxios(TRANSACTION_SMS_VENDOR_DAILY)
  );
  inject(
    "transactionDataDailyRepository",
    repositoryWithAxios(TRANSACTION_SMS_DAILY)
  );

  inject("adsVideoTypeRepository", repositoryWithAxios(ADS_VIDEO_TYPE));
  inject("whitelistIpRepository", repositoryWithAxios(WHITELIST_IP));

  inject("systemConfigRepository", repositoryWithAxios(SYSTEM_CONFIG));

  inject("phoneGroupRepository", repositoryWithAxios(PHONE_GROUP));

  inject("priceServiceRepository", repositoryWithAxios(PRICE_SERVICE));
  inject("emailReportRepository", repositoryWithAxios(EMAIL_REPORT));
  inject("fileReportRepository", repositoryWithAxios(FILE_REPORT));
  // You can reuse the repositoryWithAxios object:
  // inject("userRepository", repositoryWithAxios('/users'));
  inject("userIpRepository", repositoryWithAxios(USER_IP));

  inject(
    "logMmsDistributionRepository",
    repositoryWithAxios(LOG_MMS_DISTRIBUTION)
  );

  inject(
    "logSmsDistributionRepository",
    repositoryWithAxios(LOG_SMS_DISTRIBUTION)
  );
  inject(
    "logSmsVendorDistributionRepository",
    repositoryWithAxios(LOG_SMS_vendor_DISTRIBUTION)
  );

  inject("dataPackageRepository", repositoryWithAxios(DATA_PACKAGE));
  inject("invoiceRepository", repositoryWithAxios(INVOICE));
  inject("adsDataRepository", repositoryWithAxios(DATA_SPONSOR));
  inject("rechargeOrderRepository", repositoryWithAxios(RECHARGE_ORDER));
  inject("feedbackRepository", repositoryWithAxios(FEEDBACK));
  inject("blockingCategoryRepository", repositoryWithAxios(BLOCKING_CATEGORY));
  inject("blockUrlRepository", repositoryWithAxios(BLOCK_URL));
  inject("adsReviewRepository", repositoryWithAxios(ADS_REVIEW));
  inject("targetingMarcoRepository", repositoryWithAxios(MACRO));
  inject("actionCategoryRepository", repositoryWithAxios(ACTION_CATERORY));
  inject("eventTrackingFormDiaLog", repositoryWithAxios(EVENT_TRACKING));
  inject("policyRepository", repositoryWithAxios(POLICY));
  inject("manageAgeGroupRepository", repositoryWithAxios(MANAGE_AGE_GROUP));
  inject("constractFormDiaLog", repositoryWithAxios(CONSTRACT));
  inject("catidConfigDialog", repositoryWithAxios(SYNC_MANUAL_CAT_CONFIG));
  inject("brandnameRepository", repositoryWithAxios(SYNC_MANUAL_BRANDNAME_CONFIG));
  inject("agencyRepository", repositoryWithAxios(SYNC_MANUAL_AGENCY_CONFIG));
};
