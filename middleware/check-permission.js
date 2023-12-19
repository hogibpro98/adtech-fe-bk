export default ({ route, app, error, $auth }) => {
  if (!$auth.loggedIn) {
    return;
  }
  let hasPermission = true;
  if (route.matched && route.matched.length > 0) {
    hasPermission = route.matched.some(routeRecord => {
      const options = routeRecord.components.default.options;
      const permission = options.permission;
      const name = route.name.endsWith("-id")
        ? route.name.slice(0, -3)
        : route.name;
      if (permission) {
        return app.$can(permission);
      } else if (permission === false) {
        return true;
      } else {
        return app.$can(`${name}.view`);
      }
    });
  }

  if (!hasPermission) {
    error({ statusCode: 404 });
  }
};
