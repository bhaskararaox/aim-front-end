import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {SearchData} from "../models/app.searchdata";
import {AppInitData} from "../models/app.initdata";
import {AppEmonEdpData} from "../models/app.emonedpdata";
import {QueryResult} from "../models/app.queryresult";
import {User} from "../models/app.user";

@Injectable()
export class MessageService {
  private searchCompletedSubject = new Subject<QueryResult>();
  private exportResultsSubject = new Subject<any>();
  private exportTlistSubject = new Subject<any>();
  private showDetailsSubject = new Subject<string>();
  private showErrorMessageSubject = new Subject<any>();
  private showSuccessMessageSubject = new Subject<any>();
  private showInfoMessageSubject = new Subject<any>();
  private showComponentDetailsSubject = new Subject<string>();
  private showIsaExtensionDetailsSubject = new Subject<any>();
  private showLcatChartDetailsSubject = new Subject<string>();
  private exportResultsCompletedSubject = new Subject<any>();
  private gotInitDataSubject = new Subject<AppInitData>();
  private gotUserSubject = new Subject<User>();
  private dataPublishedDate = new Subject<string>();
  private showSpinnerSubject = new Subject<any>();
  private hideSpinnerSubject = new Subject<any>();
  private removeSpinnerSubject = new Subject<any>();
  private showLtFootPrintDetailsSubject = new Subject<any>();
  private showEmonEdpWindowSubject = new Subject<AppEmonEdpData>();
  private hideEmonEdpWindowSubject = new Subject<any>();
  private queryBroadcastedSubject = new Subject<SearchData>();
  private switchUserViewSubject = new Subject<any>();
  private toggleSearchBoxSubject = new Subject<any>();
  private sharedQueryLoadSubject = new Subject<any>();

  public loadSharedQuery(query: string) {
    this.sharedQueryLoadSubject.next(query);
  }

  public getSharedQueryLoadedCompleted(): Observable<string> {
    return this.sharedQueryLoadSubject.asObservable();
  }

  public toggleSearchBox() {
    this.toggleSearchBoxSubject.next();
  }

  public getToggleSearchBoxCompleted(): Observable<any> {
    return this.toggleSearchBoxSubject.asObservable();
  }

  public searchCompleted(queryResult: QueryResult) {
    this.searchCompletedSubject.next(queryResult);
  }

  public exportResults() {
    this.exportResultsSubject.next();
  }

  public exportTlist() {
    this.exportTlistSubject.next();
  }

  public showErrorMessage(errorSummary: string, errorDetail: string) {
    this.showErrorMessageSubject.next({errorSummary: errorSummary, errorDetail: errorDetail});
  }

  public showSuccessMessage(successSummary: string, successDetail: string) {
    this.showSuccessMessageSubject.next({successSummary: successSummary, successDetail: successDetail});
  }

  public showInfoMessage(infoSummary: string, infoDetail: string) {
    this.showInfoMessageSubject.next({infoSummary: infoSummary, infoDetail: infoDetail});
  }

  public showDetailsWindow(traceName: string) {
    this.showDetailsSubject.next(traceName);
  }

  public showComponentDetails(nodeData: any) {
    this.showComponentDetailsSubject.next(nodeData);
  }

  public showIsaExtensionDetails(nodeData: any, weighted: boolean) {
    this.showIsaExtensionDetailsSubject.next({nodeData: nodeData, weighted: weighted});
  }

  public showLtFootPrintDetailsWindow(traceName: string) {
    this.showLtFootPrintDetailsSubject.next(traceName);
  }

  public showLcatChartDetailsDialog(nodeData: any) {
    this.showLcatChartDetailsSubject.next(nodeData);
  }

  public exportResultsCompleted() {
    this.exportResultsCompletedSubject.next();
  }

  public gotInitData(appInitData: AppInitData) {
    this.gotInitDataSubject.next(appInitData)
  }

  public gotUser(user: User) {
    this.gotUserSubject.next(user)
  }

  public showSpinner() {
    console.log("show summary")
    this.showSpinnerSubject.next();
  }

  public hideSpinner() {
    this.hideSpinnerSubject.next();
  }

  public removeSpinner() {
    this.removeSpinnerSubject.next();
  }

  public showEmonEdpWindow(emonEdpData: AppEmonEdpData) {
    this.showEmonEdpWindowSubject.next(emonEdpData);
  }

  public hideEmonEdpWindow(bool: boolean) {
    this.hideEmonEdpWindowSubject.next(bool);
  }

  public queryBroadcasted(searchData: SearchData) {
    this.queryBroadcastedSubject.next(searchData);
  }

  public switchUserView() {
    this.switchUserViewSubject.next();
  }

  public setDataPublishedDate(dataPublishedDate: string) {
    this.dataPublishedDate.next(dataPublishedDate);
  }

  public getSearchCompleted(): Observable<any> {
    return this.searchCompletedSubject.asObservable();
  }

  public getExportResults(): Observable<any> {
    return this.exportResultsSubject.asObservable();
  }

  public getExportTlist(): Observable<any> {
    return this.exportTlistSubject.asObservable();
  }

  public getShowDetails(): Observable<string> {
    return this.showDetailsSubject.asObservable();
  }

  public getShowErrorMessage(): Observable<any> {
    return this.showErrorMessageSubject.asObservable();
  }

  public getShowSuccessMessage(): Observable<any> {
    return this.showSuccessMessageSubject.asObservable();
  }

  public getShowInfoMessage(): Observable<any> {
    return this.showInfoMessageSubject.asObservable();
  }

  public getShowComponentsDetails(): Observable<any> {
    return this.showComponentDetailsSubject.asObservable();
  }

  public getShowIsaExtensionDetails(): Observable<any> {
    return this.showIsaExtensionDetailsSubject.asObservable();
  }

  public getShowLtFootPrintDetails(): Observable<string> {
    return this.showLtFootPrintDetailsSubject.asObservable();
  }

  public getShowLcatChartDetailsDialog(): Observable<any> {
    return this.showLcatChartDetailsSubject.asObservable();
  }

  public getExportResultsCompleted(): Observable<any> {
    return this.exportResultsCompletedSubject.asObservable();
  }

  public getGotInitData(): Observable<AppInitData> {
    return this.gotInitDataSubject.asObservable();
  }

  public getGotUser(): Observable<User> {
    return this.gotUserSubject.asObservable();
  }

  public getShowSpinner(): Observable<any> {
    return this.showSpinnerSubject.asObservable();
  }

  public getHideSpinner(): Observable<any> {
    return this.hideSpinnerSubject.asObservable();
  }

  public getRemoveSpinner(): Observable<any> {
    return this.removeSpinnerSubject.asObservable();
  }

  public getShowEmonEdpWindow(): Observable<AppEmonEdpData> {
    return this.showEmonEdpWindowSubject.asObservable();
  }

  public getHideEmonEdpWindow(): Observable<boolean> {
    return this.hideEmonEdpWindowSubject.asObservable();
  }

  public getQueryBroadcasted(): Observable<any> {
    return this.queryBroadcastedSubject.asObservable();
  }

  public getSwitchUserView(): Observable<any> {
    return this.switchUserViewSubject.asObservable();
  }

  /***************************************************
   * Making dataPublishedDate variable as observable *
   * for header component                            *
   ***************************************************/
  public getDataPublishedDate(): Observable<string> {
    return this.dataPublishedDate.asObservable();
  }
}
