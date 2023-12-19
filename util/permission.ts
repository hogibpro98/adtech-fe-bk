import { union } from "lodash";
import { CODE_SUCCESS } from "~/constants/code";
import { TIME_GET_PERMISSIONS } from "~/constants/keyStoreAuth";
import { isEmpty } from "~/util/typeof";
import { AuthInterface } from "~/interface/plugin/auth";
import { ApiActionInterface } from "~/interface/plugin/repository";

interface InputPermissionInterface {
  namePage?: string;
  app?: {
    $apiAction: ApiActionInterface;
  };
  $auth?: AuthInterface;
}

export const fetchPermissionToStorage = async ({
  namePage,
  app,
  $auth
}: InputPermissionInterface = {}) => {
  if (!$auth.loggedIn) {
    return;
  }

  try {
    const timeGetPermissions =
      $auth.$storage.getState(TIME_GET_PERMISSIONS) || {};
    if (isEmpty(timeGetPermissions[namePage])) {
      const res = await app.$apiAction.getPagePermissions({
        name: namePage
      });
      if (res.code === CODE_SUCCESS) {
        const permissions = $auth.user.permissions || [];

        const newPermissions = union(permissions, res.data);
        const user = $auth.user;
        $auth.setUser({
          ...user,
          permissions: newPermissions
        });
        timeGetPermissions[namePage] = Date.now();
        $auth.$storage.setState(TIME_GET_PERMISSIONS, timeGetPermissions);
      }
    }
  } catch (e) {}
};
