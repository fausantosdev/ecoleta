import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  index("routes/landing.tsx"),
  route("sign-in","routes/sign-in.tsx"),
  route("sign-up","routes/sign-up.tsx"),
  layout("layouts/app.tsx", [
    route("home", "routes/home.tsx"),
    route("new-point","routes/create-point.tsx"),
  ]),
] satisfies RouteConfig;
