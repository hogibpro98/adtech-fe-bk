import moment from "moment/src/moment";
import { USER_STATUS } from "~/constants/code";
import { SQL_TIMESTAMP } from "~/constants/format";

export default ({ redirect, route, $auth, app }) => {
  const isVerified = $auth.user.status === USER_STATUS.ACTIVE;
  if (!isVerified && route.name !== "profile") {
    redirect("/profile");
  }
  if (app.$isPasswordExpired() && route.name !== "profile") {
    redirect("/profile");
  }
};
