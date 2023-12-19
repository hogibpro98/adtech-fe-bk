import { fetchPermissionToStorage } from "~/util/permission";

export default async ({ route, app, error, $auth }) => {
  console.log(route);
  fetchPermissionToStorage({
    namePage: route.name,
    app,
    $auth
  });
  fetchPermissionToStorage({
    namePage: "system-config",
    app,
    $auth
  });
};
