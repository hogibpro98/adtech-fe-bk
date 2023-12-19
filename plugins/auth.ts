import moment from "moment";
import { TIME_GET_PERMISSIONS } from "~/constants/keyStoreAuth";
import { isArray, isString, isEmpty } from "~/util/typeof";
import GlobalDataInterface from "~/interface/data/global";
import { fetchPermissionToStorage } from "~/util/permission";
import { SQL_TIMESTAMP } from "~/constants/format";

export default function(
  { $auth, app, $cancelAllRequest }: GlobalDataInterface,
  inject
) {
  inject("can", (checkPerm?: string | Array<string>): boolean => {
    if (!$auth.user) {
      return false;
    }
    if (isEmpty(checkPerm)) {
      return true;
    }
    const permissions =
      $auth.user?.permissions || $auth.$storage.getState(`permissions`) || [];
    if (Array.isArray(checkPerm)) {
      return checkPerm.some(r => permissions.includes(r));
    } else {
      return permissions.includes(checkPerm);
    }
  });
  inject("pageCan", (action: string): boolean => {
    return app.$can(`${app.router.currentRoute.name}.${action}`);
  });
  inject("authHasRole", (roleName: Array<string> | string): boolean => {
    const roles = $auth.user?.roles || [];
    if (isArray(roleName) && typeof roleName !== "string") {
      return roles.some(role =>
        roleName.some(roleNameCheck => role?.name === roleNameCheck)
      );
    } else if (isString(roleName)) {
      return roles.some(role => role?.name === roleName);
    }
    return false;
  });

  inject("logout", async () => {
    await $cancelAllRequest();
    await $auth.logout();
    $auth.$storage.removeState(TIME_GET_PERMISSIONS);
    localStorage.clear();
  });

  inject("fetchPermissions", async (pageName: string) => {
    await fetchPermissionToStorage({
      namePage: pageName,
      app,
      $auth
    });
  });

  inject("hasService", (serviceName: Array<string> | string) => {
    const authServices = $auth.user.services || [];
    if (isArray(serviceName) && typeof serviceName !== "string") {
      return authServices.some(service =>
        serviceName.some(serviceNameCheck => service === serviceNameCheck)
      );
    } else if (isString(serviceName)) {
      return authServices.some(service => service === serviceName);
    }
    return false;
  });

  inject("isPasswordNearExpired", () => {
    const timeLeft = Math.floor(
      passwordExpiredAt($auth).diff(moment(), "hours") / 24
    );
    console.log(
      "expired_at",
      passwordExpiredAt($auth).format("YYYY-MM-DD HH:mm:ss"),
      timeLeft
    );
    return timeLeft < 7 && timeLeft >= 0;
  });
  inject("isPasswordExpired", () => {
    if ($auth.loggedIn) {
      const isExpired = passwordExpiredAt($auth).isBefore(moment());
      return isExpired;
    }
    return false;
  });
}

const passwordExpiredAt = $auth => {
  const passwordUpdatedAt =
    $auth.user?.password_updated_at || $auth.user?.email_verified_at;
  if (passwordUpdatedAt) {
    return moment(passwordUpdatedAt, SQL_TIMESTAMP)
      .add(90, "days")
      .startOf("day");
  } else {
    return moment()
      .subtract(1, "days")
      .startOf("day");
  }
};
