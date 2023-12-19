import { AGENCY_WALLET } from "@/constants/resource";
import { CODE_SUCCESS } from "@/constants/code";
import { Inject } from "@nuxt/types/app";
import GlobalDataInterface from "~/interface/data/global";

export default function(
  { $auth, $axios, $toast }: GlobalDataInterface,
  inject: Inject
) {
  inject(
    "fetchViettelWallet",
    async (): Promise<void> => {
      try {
        const { data } = await $axios.post(`${AGENCY_WALLET}/get-balance`);
        if (data && data.code === CODE_SUCCESS) {
          $auth.$storage.setState("user", {
            ...$auth.user,
            wallet: data.data
          });
        } else {
          $toast.global.action_fail();
        }
      } catch (e) {}
    }
  );
}
