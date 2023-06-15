// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  baseUrl: "https://127.0.0.1:8443/traceanalytics-ws/",
  // baseUrl: "http://127.0.0.1:8080/traceanalytics-ws/",
  VERSION: require("../../package.json").version,
  FRIENDLY_VERSION: "19.10.1"
};
