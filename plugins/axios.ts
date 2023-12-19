import { TIME_GET_PERMISSIONS } from "@/constants/keyStoreAuth";
import { debounce } from "lodash";
import { AxiosError } from "axios";
import GlobalDataInterface from "~/interface/data/global";
import { isArray } from "~/util/typeof";
export default function(
  { $axios, $auth, $toast, error }: GlobalDataInterface,
  inject
) {
  let source = $axios.CancelToken.source();
  const debounceNoAuth = debounce(function() {
    $toast.global.no_auth();
  }, 500);

  $axios.interceptors.request.use(request => {
    const token = $auth.strategy.token.get();
    if (token) {
      request.headers.common.Authorization = `${token}`;
    }
    request.cancelToken = source.token;
    return request;
  });

  inject("cancelAllRequest", () => {
    source.cancel();
    source = $axios.CancelToken.source();
  });

  // $axios.onRequest(config => {
  //   //
  // });

  $axios.interceptors.response.use(
    response => response,
    (e: AxiosError) => {
      const code = e?.response?.status;
      switch (code) {
        case 401:
          if (!e.response?.data?.code) {
            debounceNoAuth();
          }
          localStorage.clear();
          $auth.$storage.removeState(TIME_GET_PERMISSIONS);
          if ($auth.loggedIn) {
            $auth.logout();
          }
          break;
        case 403:
          $toast.global.no_permission();
          if (e.config.method === "get") {
            error({ statusCode: 403 });
          }
          break;
        case 429:
          $toast.global.too_many_action();
          break;
        case 400:
        case 432:
          if (e.response.data?.message) {
            $toast.global.server_error_msg(e.response.data.message);
          } else {
            $toast.global.action_fail();
          }
          break;
        case 422: {
          try {
            const errors = e.response.data.errors;
            const errorCustom = {};
            Object.keys(errors).forEach(key => {
              if (key.includes(".")) {
                const [prefix] = key.split(".");
                const newValue = isArray(errors[key])
                  ? errors[key]
                  : [errors[key]];
                if (errorCustom[prefix]) {
                  errorCustom[prefix].push(...newValue);
                } else {
                  errorCustom[prefix] = newValue;
                }
              }
            });
            Object.keys(errorCustom).forEach(key => {
              if (!errors[key]) {
                errors[key] = errorCustom[key];
              }
            });
          } catch (e) {
            console.log(e);
          }

          return Promise.reject(e);
        }
        case 500:
          $toast.global.action_fail();
          break;
        default:
          break;
      }
      return Promise.reject(e);
    }
  );
}
