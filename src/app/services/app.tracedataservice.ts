import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import {OneTimeLoginUser} from "../models/app.onetimeloginuser";
import {environment} from '../../environments/environment';
import {AppEmonEdpData} from "../../app/models/app.emonedpdata";
import {AppPaginatedSearchRequest} from "../models/app.paginatedsearchrequest";
import {SearchExportRequest} from "../models/app.searchexportrequest";
import {AppReportdates} from "../models/app.reportdates";
import {AppFeedbackRequest} from "../models/app.feedbackrequest";


@Injectable()
export class TraceDataService {

  private baseUrl: String;

  constructor(private http: Http) {
    this.baseUrl = environment.baseUrl;
  }

  public init() {
    return this.http.get(this.baseUrl + "init", {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public search(input: string) {
    return this.http.post(this.baseUrl + "search", input, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public exportSearch(exportRequest: SearchExportRequest) {
    return this.http.post(this.baseUrl + "search/export/results", exportRequest, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public paginatedSearch(searchRequest: AppPaginatedSearchRequest) {
    return this.http.post(this.baseUrl + "search/paginated", searchRequest, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public emailPaginatedSearch(searchRequest: SearchExportRequest) {
    return this.http.post(this.baseUrl + "emailPaginatedSearch", searchRequest, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getTraceInfo(input: string) {
    return this.http.post(this.baseUrl + "gettraceinfo", input, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getInstructions(input: string) {
    return this.http.post(this.baseUrl + "getinstructions", input, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public saveFavouriteQuery(favouriteQuery: string) {
    return this.http.post(this.baseUrl + "savefavouritequery", favouriteQuery, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public removeFavouriteQuery(id: number) {
    return this.http.post(this.baseUrl + "removefavouritequery", id, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public updateFavouriteQueryUsage(idQuery: number) {
    return this.http.post(this.baseUrl + "updatefavouritequeryusage", idQuery, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getUserFavouriteQueries() {
    return this.http.get(this.baseUrl + "getuserfavouritequeries", {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getSharedQuery(querySharedId: string) {
    return this.http.post(this.baseUrl + "getsharedquery", querySharedId, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public exitsSharedQuery(querySharedId: string) {
    return this.http.post(this.baseUrl + "existssharedquery", querySharedId, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public searchLike(traceName: string) {
    return this.http.post(this.baseUrl + "like", traceName, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getLtFootPrintFileContent(traceName: string) {
    return this.http.post(this.baseUrl + "getltfootprintfilecontent", traceName, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public hasUserLoggedIn() {
    return this.http.get(this.baseUrl + "auth/hasuserloggedin", {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public isUserAuthorized() {
    return this.http.get(this.baseUrl + "auth/isuserauthorized", {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public insertFirstTimeLogin(receiveEmails: string) {
    return this.http.post(this.baseUrl + "auth/insertfirsttimelogin", receiveEmails, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getUserAuthenticated(userObject: OneTimeLoginUser) {
    let theUser: string = JSON.stringify(userObject);
    return this.http.post(this.baseUrl + "auth/getuserauthenticated", theUser, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getLCATChartData(input: string) {
    return this.http.post(this.baseUrl + "/getlcatdata", input, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getEDPSampleChartComboboxData(userObject: AppEmonEdpData) {
    let obj = {
      "traceName": userObject.traceName,
      "configuration": userObject.configuration
    };
    let headers = new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'});
    let options = new RequestOptions({withCredentials: true, headers: headers});
    let response = this.http.post(this.baseUrl + "emon/metrics", obj, options).map((res: Response) => {
      return res.json();
    });
    return response;
  }

  public getEDPSampleChartMetricData(userObject: AppEmonEdpData) {
    let obj = {
      "traceName": userObject.traceName,
      "configuration": userObject.configuration,
      "metricList": userObject.metrics,
      "socketList": userObject.sockets,
      "packageList": userObject.packages,
      "coreList": userObject.cores
    };
    let headers = new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'});
    let options = new RequestOptions({withCredentials: true, headers: headers});
    let response = this.http.post(this.baseUrl + "emon/metrics/data", obj, options).map((res: Response) => {
      return res.json();
    });
    return response;
  }

  public getEDPPerformanceMetricTableData(filterData: AppEmonEdpData) {
    const requestObj = {
      "traceName": filterData.traceName,
      "configuration": filterData.configuration,
      "metricList": filterData.metrics,
      "socketList": filterData.sockets,
      "packageList": filterData.packages,
      "coreList": filterData.cores
    };
    let headers = new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'});
    let options = new RequestOptions({withCredentials: true, headers: headers});
    let response = this.http.post(this.baseUrl + "emon/performance_table_data", requestObj, options).map((res: Response) => {
      return res.json();
    });
    return response;
  }

  public getSummaryBySegment(input: string) {
    return this.http.post(this.baseUrl + "/summary/segment", input, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getSummaryByClassification(input: string) {
    return this.http.post(this.baseUrl + "/summary/classification ", input, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getSummaryByIsaComponent(input: string) {
    return this.http.post(this.baseUrl + "/summary/isabycomponent", input, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getSummaryByIsaWorkload(input: string) {
    return this.http.post(this.baseUrl + "/summary/isabyworkload", input, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getSummaryByWorkload(input: string) {
    return this.http.post(this.baseUrl + "/summary/workload/tree", input, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getUsersUsage(fromDate: string, toDate: string) {
    const reportDates = new AppReportdates(fromDate, toDate);

    return this.http.post(this.baseUrl + "usersusagepost", reportDates, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }
  public getTraceSummaryDatewiseReport(fromDate: string, toDate: string) {
    const reportDates = new AppReportdates(fromDate, toDate);

    return this.http.post(this.baseUrl + "traceSummaryDatewiseReport", reportDates, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public getTraceSummaryReport() {
    return this.http.get(this.baseUrl + "getTracingStatusReport", {
      withCredentials: true
    }).map((res: Response) => {
      console.log("res : " +  res.json())
      return res.json();
    });
  }

  public getSearchResultsSummary(input: string) {
    return this.http.post(this.baseUrl + "search/summary", input, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

  public sendFeedbackRequest(feedbackRequest: AppFeedbackRequest) {
    return this.http.post(this.baseUrl + "sendfeedback", feedbackRequest, {
      withCredentials: true
    }).map((res: Response) => {
      return res.json();
    });
  }

}
