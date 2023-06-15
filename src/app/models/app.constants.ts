export class Constants {
  public static readonly QA_BASE_URL = "https://172.25.127.100/traceanalytics-ws/";
  //public static readonly PROD_BASE_URL = "https://143.183.93.107/traceanalytics-ws/";
  public static readonly DEV_BASE_URL = "https://10.65.44.241/traceanalytics-ws/"; // dev
  public static readonly LOCAL_BASE_URL = "http://127.0.0.1:8080/traceanalytics-ws/"; // local without HTTPS
  //public static readonly LOCAL_BASE_URL = "https://127.0.0.1:8443/traceanalytics-ws/"; // local with HTTPS
  public static readonly TRACE_PREFIX = "/nfs/site/proj/ptt/traces/instruction_traces/";
  public static readonly NOT_AVAILABLE = "<not available>";
  public static readonly ADMIN_FIELDS: string[] = ["invalidfields", "ispublished", "ispreproduction"];
}

