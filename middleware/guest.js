export default ({ $auth, redirect, route }) => {
  if ($auth.loggedIn) {
    if (route.query.redirect) {
      return redirect(route.query.redirect);
    }

    if ($auth.user.roles[0]?.default_page) {
      return redirect($auth.user.roles[0]?.default_page);
    } else {
      return redirect.push("/dashboard");
    }
  }
};
