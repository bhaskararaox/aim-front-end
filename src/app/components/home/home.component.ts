import {Component, OnDestroy, OnInit} from "@angular/core";
import {SearchData} from "../../models/app.searchdata";
import {QueryResult} from "../../models/app.queryresult";
import {TraceDataService} from "../../services/app.tracedataservice";
import {MessageService} from "../../services/app.messageservice";
import {Subscription} from "../../../../node_modules/rxjs/Subscription";
import {BSModalContext, Modal} from "../../../../node_modules/angular2-modal/plugins/bootstrap";
import * as $ from "jquery";
import {User} from "../../models/app.user";
import {TraceResult} from "../../models/app.traceresult";
import {DetailsDialogComponent} from "../detailsdialog/detailsdialog.component";
import {overlayConfigFactory} from "angular2-modal";
import {ComponentDialogComponent} from "../componentdialog/componentdialog.component";
import {LcatChartDialogComponent} from "../lcatchartdialog/lcatchartdialog.component";
import {IsaExtensionDialogComponent} from "../isaextensiondialog/isaextensiondialog.component";
import {Location} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit, OnDestroy {

  public traceCount: number;
  public workloadCount: number;
  public componentCount: number;
  public dataPublishedDate: string = null;
  public isDataLoaded = false;
  public searchData: SearchData = null;
  public queryResult: QueryResult = null;
  private dataService: TraceDataService;
  private messageService: MessageService;
  private searchStartedSubscription: Subscription;
  private searchCompletedSubscription: Subscription;
  private showLtFootPrintDetailsSubscription: Subscription;
  private showDetailsSubscription: Subscription;
  private exportResultsCompletedSubscription: Subscription;
  private modal: Modal;
  public showEDPPlots = false;
  public resultsAvailable = false;
  private router: Router;
  private paramsSubscription: Subscription;
  private querySharedId: string;

  constructor(private route: ActivatedRoute, router: Router, private location: Location,
              dataService: TraceDataService, messageService: MessageService, modal: Modal) {
    this.router = router;
    this.dataService = dataService;
    this.messageService = messageService;
    this.modal = modal;
  }

  ngOnInit() {
    this.starting();
    this.messageService.getQueryBroadcasted().subscribe((searchData) => this.onQueryBroadcasted(searchData));
    this.searchCompletedSubscription = this.messageService.getSearchCompleted().subscribe(queryResult => this.onSearchCompleted(queryResult));
    this.showDetailsSubscription = this.messageService.getShowDetails().subscribe(traceName => this.onShowDetails(traceName));
    this.exportResultsCompletedSubscription = this.messageService.getExportResultsCompleted().subscribe(() => this.onExportResultsCompleted());
    this.messageService.getShowComponentsDetails().subscribe(nodeData => this.onShowComponentsDetails(nodeData));
    this.messageService.getShowIsaExtensionDetails().subscribe(data => this.onShowIsaExtensionDetails(data.nodeData, data.weighted));
    this.messageService.getShowLcatChartDetailsDialog().subscribe(nodeData => this.onShowLcatChartDetails(nodeData));
    this.showLtFootPrintDetailsSubscription = this.messageService.getShowLtFootPrintDetails().subscribe(traceName => this.onShowLtFootPrintDetails(traceName));
    this.messageService.getToggleSearchBoxCompleted().subscribe(() => this.toggleLeftPane());
  }

  private starting(): void {
    this.getInitData();

  }

  private verifySharedQuery() {
    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      this.querySharedId = params["query"] || null;
      this.notifyToLoadSharedQuery();
    });
  }

  private notifyToLoadSharedQuery(): void {
    if (this.querySharedId) {
      this.dataService.exitsSharedQuery(this.querySharedId).subscribe(data => {
        if (data) {
          console.log(">>> Send Load Shared Query Notification");
          this.messageService.loadSharedQuery(this.querySharedId);
        } else {
          console.log(">>> Query Not Found");
          this.messageService.showErrorMessage("Query Not Found", "The shared query got removed or is not available.")
          this.removeSharedQueryParam();
        }
      });
    }
  }

  private removeSharedQueryParam(): void {
    const url: string = this.router.url.substring(0, this.router.url.indexOf("?"));
    this.location.replaceState(url);
  }

  private getInitData(): void {
    this.showSpinner();
    this.dataService.init().subscribe(data => {
      this.hideSpinner();
      if (!data.user.authorized) {
        throw new Error("User is Unauthorized");
      } else {
        this.verifySharedQuery();
        this.messageService.gotUser(new User(data.user.admin, data.user.authorized, data.user.name));
        this.messageService.gotInitData(data.data);
      }
    });
  }

  public toggleLeftPane() {
    const inner = $("#navLeft");
    const button = $(".navLeft-btn");
    if (inner.css("margin-left") == "0px") {
      this.hideLeftPane(inner, button);
    } else {
      this.showLeftPane(inner, button);
    }
  }

  private hideLeftPane(inner: JQuery, button: JQuery) {
    inner.animate({"margin-left": "-70%"});
    button.animate({"width": "70px"}, 0);
    button.animate({"right": "-70px"}, 0);
    button.html("<p style='margin-top:10px;margin-left:10px;'>Build Query</p>");
  }

  private showLeftPane(inner: JQuery, button: JQuery) {
    inner.animate({"margin-left": "0px"});
    button.animate({"width": "30px"}, 0);
    button.animate({"right": "-30px"}, 0);
    button.html("<img src='assets/images/collapse_left.png' width='26' height='38' style='margin-top: 14px; margin-left: 2px;' />");
  }

  private onQueryBroadcasted(searchData: SearchData) {
    this.traceCount = null;
    this.workloadCount = null;
    this.componentCount = null;
    this.dataPublishedDate = null;

    this.resultsAvailable = false;
    this.isDataLoaded = false;
    this.toggleLeftPane();
    this.searchData = searchData;
    this.updateQueryParams(searchData);
  }

  private updateQueryParams(searchData: SearchData) {
    if (searchData.shareId) {

      const url = this.router.createUrlTree([], {
        queryParams: {query: searchData.shareId},
        relativeTo: this.route,
        skipLocationChange: true
      });

      this.location.replaceState(url.toString());
    }
  }

  private onSearchCompleted(queryResult: QueryResult) {
    this.traceCount = queryResult.totalElements;
    this.workloadCount = queryResult.totalDistinctWorkloads;
    this.componentCount = queryResult.totalDistinctComponents;
    this.dataPublishedDate = queryResult.dataPublishedDate;

    // updating dataPublishedDate variable in messageService
    this.messageService.setDataPublishedDate(this.dataPublishedDate);

    this.resultsAvailable = this.traceCount !== 0 ? true : false;
    this.isDataLoaded = true;
    this.queryResult = queryResult;
  }

  private onShowLtFootPrintDetails(traceName: string) {
    this.hideLeftPane($("#navLeft"), $(".navLeft-btn"));
    this.showSpinner();

    this.dataService.getLtFootPrintFileContent(traceName).subscribe(result => {
      this.hideSpinner();
      if (result.data === "") {
        return this.modal.alert().title("Lt Footprint Content").body("&lt;not available&gt;").open();
      } else {
        return this.modal.alert().title("Lt Footprint Content").body(result.data).open();
      }
    });
  }

  public exportResults() {
    this.showSpinner();
    this.messageService.exportResults();
  }

  public exportTlist() {
    this.messageService.exportTlist();
  }

  private onExportResultsCompleted() {
    this.hideSpinner();
  }

  private onShowDetails(traceName: string) {
    this.hideLeftPane($("#navLeft"), $(".navLeft-btn"));

    const filter = this.queryResult.data.filter(tr => tr.traceName === traceName);
    if (filter.length === 1) {
      const selectedTrace: TraceResult = filter[0];

      this.showSpinner();

      let sequence: string = null;
      if (this.searchData.instructionSequence != null) {
        sequence = this.searchData.instructionSequence.toLowerCase();
      }

      const input = {
        "traceName": selectedTrace.traceName,
        "sequence": sequence,
        "offset": selectedTrace.disasmOffset
      };

      const jsonInput = JSON.stringify(input);
      console.log(jsonInput);
      this.dataService.getTraceInfo(jsonInput).subscribe(result => {
        this.hideSpinner();
        return this.modal.open(DetailsDialogComponent, overlayConfigFactory({
          size: "lg",
          trace: result.data.trace,
          highlight: result.data.highlight
        }, BSModalContext));
      });
    }
  }

  private onShowComponentsDetails(nodeData) {
    this.hideLeftPane($("#navLeft"), $(".navLeft-btn"));
    return this.modal.open(ComponentDialogComponent, overlayConfigFactory({components: nodeData}, BSModalContext));
  }

  private onShowIsaExtensionDetails(nodeData, weighted) {
    this.hideLeftPane($("#navLeft"), $(".navLeft-btn"));
    return this.modal.open(IsaExtensionDialogComponent, overlayConfigFactory({
      isaextensions: nodeData,
      weighted: weighted
    }, BSModalContext));
  }

  private onShowLcatChartDetails(nodeData) {
    this.hideLeftPane($("#navLeft"), $(".navLeft-btn"));
    return this.modal.open(LcatChartDialogComponent, overlayConfigFactory({lcatdata: nodeData}, BSModalContext));
  }

  private showSpinner() {
    this.messageService.showSpinner();
  }

  private hideSpinner() {
    this.messageService.hideSpinner();
  }

  ngOnDestroy(): void {
    if (this.searchStartedSubscription) {
      this.searchStartedSubscription.unsubscribe();
    }
    if (this.searchCompletedSubscription) {
      this.searchCompletedSubscription.unsubscribe();
    }
  }

}
