import { Route } from "vue-router/types/router";
import { AxiosRequestConfig, AxiosStatic } from "axios";
import { NuxtOptionsRouter } from "@nuxt/types/config/router";
import { UserInterface } from "~/interface/data/user";
import { StoreInterface } from "~/interface/store";
import { FiltersInterface } from "~/interface/plugin/filters";
import {
  ApiActionInterface,
  RepositoryInterface
} from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { AuthInterface } from "~/interface/plugin/auth";
export interface AxiosInterface extends AxiosStatic {
  onError(cb: Function): void;
  onRequest(config: AxiosRequestConfig): void;
}

export interface ENVInterface {
  baseUrl: string;
  BASE_URL: string;
  ECHO_HOST: string;
  UPLOAD_URL: string;
  SDK_URL: string;
}
export interface VueRouter {
  currentRoute: {
    fullPatch: string;
    hash: string;
    name: string;
    path: string;
    meta: object;
    matched: Array<any>;
    params: object;
    query: object;
  };
}
export interface GlobalDataInterface {
  app: GlobalDataInterface;
  env: ENVInterface;
  error: Function;
  route: Route;
  router: VueRouter;
  $auth: AuthInterface;
  $user: UserInterface;
  $store: StoreInterface;
  $axios: AxiosInterface;
  $toast: ToastInterface;
  $filters: FiltersInterface;
  $apiAction: ApiActionInterface;
  $permissionRepository: RepositoryInterface;
  $groupAgeRepository: RepositoryInterface;
  $roleRepository: RepositoryInterface;
  $targetingTagRepository: RepositoryInterface;
  $reportReasonRepository: RepositoryInterface;
  $adsTypeRepository: RepositoryInterface;
  $targetingLocationRepository: RepositoryInterface;
  $inventoryDisplayRepository: RepositoryInterface;
  $channelRepository: RepositoryInterface;
  $zoneRepository: RepositoryInterface;
  $campaignRepository: RepositoryInterface;
  $bannerRepository: RepositoryInterface;
  $adsMMSRepository: RepositoryInterface;
  $adsSmsRepository: RepositoryInterface;
  $adsRepository: RepositoryInterface;
  $genderRepository: RepositoryInterface;
  $osRepository: RepositoryInterface;
  $networkRepository: RepositoryInterface;
  $adsPriceRepository: RepositoryInterface;
  $notificationPatternRepository: RepositoryInterface;
  $baseUrl: RepositoryInterface;
  $advertiserBannerRepository: RepositoryInterface;
  $advertiserCampaignRepository: RepositoryInterface;
  $advertiserChannelRepository: RepositoryInterface;
  $advertiserInventoryRepository: RepositoryInterface;
  $advertiserZoneRepository: RepositoryInterface;
  $brandNameRepository: RepositoryInterface;
  $brandNameRequestRepository: RepositoryInterface;
  $deviceRepository: RepositoryInterface;
  $servicePackageRepository: RepositoryInterface;
  $relationshipRepository: RepositoryInterface;
  $networkDataRepository: RepositoryInterface;
  $phoneNameRepository: RepositoryInterface;
  $agencyWalletRepository: RepositoryInterface;
  $agencyPriceRepository: RepositoryInterface;
  $agencyWalletTransactionRepository: RepositoryInterface;
  $rechargeRedirectRepository: RepositoryInterface;
  $businessActivityRepository: RepositoryInterface;
  $adsConfigRepository: RepositoryInterface;
  $transactionRedirectDailyRepository: RepositoryInterface;
  $transactionMMSDailyRepository: RepositoryInterface;
  $adsVideoTypeRepository: RepositoryInterface;
  $whitelistIpRepository: RepositoryInterface;
  $systemConfigRepository: RepositoryInterface;
  $userRepository: RepositoryInterface;
  $priceServiceRepository: RepositoryInterface;

  $can(checkPerm?: string | Array<string>): boolean;
  $cancelAllRequest(): void;
}

export default GlobalDataInterface;
